const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
bookshelf.plugin(jsonColumns);
bookshelf.plugin('virtuals');

module.exports = bookshelf.Model.extend({
  'tableName': 'submissions',
  'hasTimestamps': true,
  'reviews': function() {
    const Review = require('./review');
    return this.hasMany(Review);
  },
  'initialize': function() {
    this.on('created',function() {
      const User = require('./user');
      const Review = require('./review');
      return User.nextAvailableUsers(process.env.REVIEWS_PER_SUBMISSION || 1,[]) //TODO test
        .then((users) => {
          if (users && users.length > 0) {
            return Promise.all(
              users.map((user) => {
                return new Review({
                  'user_id': user.get('id'),
                  'submission_id': this.get('id')
                }).save();
              })
            );
          } else {
            throw new Error('No users ready!');
          }
        });
    },this);
    bookshelf.Model.prototype.initialize.apply(this, arguments);
  },
  'toJSON': function(options) {
    const sendOpts = options ? Object.assign(options,{'virtuals': true}) : {'virtuals': true};
    const json = bookshelf.Model.prototype.toJSON.apply(this,sendOpts);
    json.flagged = json.flagged === true || json.flagged === 1;
    json.pinned = json.pinned === true || json.pinned === 1;
    return json;
  },
  'virtuals': {
    'score': function() {
      const reviews = this.related('reviews');
      if (reviews && reviews.length > 0) {
        return reviews.reduce((last,current) => {
          return last + current.score;
        },0) / reviews.length;
      } else {
        return null;
      }
    },
    'deviation': function() {
      const reviews = this.related('reviews');
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((last,review) => {
          return last + review.score;
        },0) / reviews.length;

        const diffs = reviews.map((review) => {
          const diff = review.score - avg;
          return diff;
        });

        const squareDiffs = reviews.map((review) => {
          const diff = review.score - avg;
          const sqr = diff * diff;
          return sqr;
        });

        const avgSquareDiff = squareDiffs.reduce((last,current) => {
          return last + current;
        },0) / squareDiffs.length;

        return Math.sqrt(avgSquareDiff);
      } else {
        return null;
      }
    }
  }
}, {
  'jsonColumns': ['data'],
  'all': function() {
    return this
      .forge()
      .orderBy('pinned','DESC')
      .orderBy('created_at','DESC')
      .fetchAll({
        'withRelated': 'reviews'
      });
  },
  'byId': function(id) {
    return this.forge().query((qb) => {
      qb.where('id',id);
    }).fetch();
  },
  'bySourceAndExternalId': function(source,externalId) {
    return this
      .forge()
      .query({
        'where': {
          'source': source,
          'external_id': externalId
        }
      })
      .fetch()
  }
});
