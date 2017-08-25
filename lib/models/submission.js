const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
bookshelf.plugin(jsonColumns);
bookshelf.plugin('virtuals');

//TODO auto assign

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
      return User.nextAvailableUser()
        .then((user) => {
          if (user) {
            return new Review({
              'user': user,
              'submission': this,
            }).save();
          }
        })
    },this);
    bookshelf.Model.prototype.initialize.apply(this, arguments);
  },
  'virtuals': {
    'score': function() {
      const reviews = this.get('reviews');
      if (reviews.length > 0) {
        return reviews.reduce((last,current) => {
          return last + current.score;
        },0) / reviews.length;
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
      .orderBy('created_at','DESC')
      .fetchAll();
  },
  'reviewed': function(email) {
    return this
      .forge()
      .query((query) => {
        const subquery = knex
          .select(['submission'])
          .from('reviews')
          .whereNotNull('score');
        query.whereIn('id',subquery);
      })
      .orderBy('created_at','DESC')
      .fetchAll({
        'withRelated': 'reviews'
      })
  },
  'unreviewed': function(email) {
    return this
      .forge()
      .query((query) => {
        const subquery1 = knex
          .select(['submission'])
          .from('reviews')
          .whereNull('score');
        const subquery2 = knex
          .select(['submission'])
          .from('reviews')
        query
          .whereIn('id',subquery1)
          .orWhereNotIn('id',subquery2);
      })
      .orderBy('created_at','DESC')
      .fetchAll({
        'withRelated': 'reviews'
      })
  },
  'byId': function(id) {
    return this.forge().query({where:{ id: id }}).fetch({
      'withRelated': 'reviews'
    })
  }
});
