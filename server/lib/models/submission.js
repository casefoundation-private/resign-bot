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
    'flags': function() {
      const reviews = this.related('reviews');
      if (reviews && reviews.length > 0) {
        return reviews.reduce((total,review) => {
          return total + (review.get('flagged') ? 1 : 0);
        },0);
      }
      return null;
    },
    'score': function() {
      const reviews = this.related('reviews');
      if (reviews && reviews.length > 0) {
        const completedReviews = reviews.filter((review) => review.get('score') !== null);
        if (completedReviews && completedReviews.length > 0) {
          return completedReviews.reduce((last,current) => {
            return last + current.get('score');
          },0) / completedReviews.length;
        }
      }
      return null;
    },
    'deviation': function() {
      const reviews = this.related('reviews');
      if (reviews && reviews.length > 0) {
        const completedReviews = reviews.filter((review) => review.get('score') !== null);
        if (completedReviews && completedReviews.length > 0) {
          const avg = completedReviews.reduce((last,review) => {
            return last + review.get('score');
          },0) / completedReviews.length;

          const diffs = completedReviews.map((review) => {
            const diff = review.get('score') - avg;
            return diff;
          });

          const squareDiffs = completedReviews.map((review) => {
            const diff = review.get('score') - avg;
            const sqr = diff * diff;
            return sqr;
          });

          const avgSquareDiff = squareDiffs.reduce((last,current) => {
            return last + current;
          },0) / squareDiffs.length;

          return Math.sqrt(avgSquareDiff);
        }
      }
      return null;
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
  },
  'published': function() {
    return this
      .forge()
      .query((qb) => {
        qb.where({'flagged':false})
        const subquery = knex
          .select(['submission_id'])
          .from('reviews')
          .where({'flagged':true})
          .whereNotNull('score');
        qb.whereNotIn('id',subquery);
      })
      .orderBy('pinned','DESC')
      .orderBy('created_at','DESC')
      .fetchAll();
  }
});
