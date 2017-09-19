const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
bookshelf.plugin(jsonColumns);

const Notification = module.exports = bookshelf.Model.extend({
  'tableName': 'notifications',
  'hasTimestamps': true,
  'user': function() {
    const User = require('./user');
    return this.belongsTo(User);
  },
},{
  'jsonColumns': ['data'],
  'userAccountReset': function(user) {
    return new Notification({
      'user_id': user.get('id'),
      'queued': true,
      'type': 'account_reset',
      'data': {}
    });
  },
  'reviewAssigned': function(review) {
    return new Notification({
      'user_id': review.get('user_id'),
      'queued': true,
      'type': 'review_assigned',
      'data': {
        'review_id': review.get('id')
      }
    });
  },
  'nextNotification': function() {
    return this
      .forge()
      .query({
        'where': {
          'queued': true,
          'errored': false
        }
      })
      .orderBy('created_at','ASC')
      .fetch({
        'withRelated': ['user']
      })
  },
  'queue': function() {
    return this
      .forge()
      .query({
        'where': {
          'queued': true
        }
      })
      .orderBy('created_at','ASC')
      .fetchAll({
        'withRelated': ['user']
      });
  },
});
