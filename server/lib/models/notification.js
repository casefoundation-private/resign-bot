const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
bookshelf.plugin(jsonColumns);
const _ = require('lodash');

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
  'userAccountWelcome': function(user) {
    return new Notification({
      'user_id': user.get('id'),
      'queued': true,
      'type': 'account_welcome',
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
  'aggregateReviewNotifications': function() {
    const deletes = [];
    const creates = [];
    return this
      .forge()
      .query({
        'where': {
          'queued': true,
          'errored': false,
          'type': 'review_assigned'
        }
      })
      .orderBy('user_id')
      .fetchAll()
      .then((reviews) => {
        const userMap = {};
        reviews.forEach((review) => {
          if (!userMap[review.get('user_id')]) {
            userMap[review.get('user_id')] = [];
          }
          userMap[review.get('user_id')].push(review);
        });
        _.values(userMap).forEach((reviews) => {
          if (reviews.length > 1) {
            reviews.forEach((review) => {
              deletes.push(review.get('id'));
            });
            creates.push(new Notification({
              'user_id': reviews[0].get('user_id'),
              'queued': true,
              'errored': false,
              'type': 'multiple_reviews_assigned',
              'data': {
                'review_ids': reviews.map((review) => {
                  return review.get('data').review_id
                })
              }
            }));
          }
        });
      })
      .then(() => {
        return knex('notifications')
          .whereIn('id',deletes)
          .delete();
      })
      .then(() => {
        return Promise.all(
          creates.map((notification) => {
            return notification.save()
          })
        );
      });
  }
});
