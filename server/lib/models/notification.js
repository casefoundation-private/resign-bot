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
  'submissionCreated': function(submission) {
    const User = require('./user');
    return User
      .allAdmins()
      .then((admins) => {
        return admins.map((user) => {
          return new Notification({
            'user_id': user.get('id'),
            'queued': true,
            'type': 'submission_created',
            'data': {
              'submission_id': submission.get('id')
            }
          });
        });
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
      .query((qb) => {
        qb.where({
          'queued': true,
          'errored': false
        });
        qb.whereIn('type',['review_assigned','submission_created']);
      })
      .orderBy('user_id')
      .fetchAll()
      .then((notifications) => {
        const typeUserMap = {
          'review_assigned': {},
          'submission_created': {}
        };
        notifications.forEach((notification) => {
          if (!typeUserMap[notification.get('type')][notification.get('user_id')]) {
            typeUserMap[notification.get('type')][notification.get('user_id')] = [];
          }
          typeUserMap[notification.get('type')][notification.get('user_id')].push(notification);
        });
        _.keys(typeUserMap).forEach((type) => {
          let newType = null;
          switch(type) {
            case 'review_assigned':
              newType = 'multiple_reviews_assigned';
              break;
            case 'submission_created':
              newType = 'multiple_submissions_created';
              break;
          }
          _.values(typeUserMap[type]).forEach((reviewNotifications) => {
            if (reviewNotifications.length > 1) {
              let reassignProp = null;
              let reassignSourceProp = null;
              const newData = {};
              switch(type) {
                case 'review_assigned':
                  reassignProp = 'review_ids';
                  reassignSourceProp = 'review_id';
                  break;
                case 'submission_created':
                  reassignProp = 'submission_ids';
                  reassignSourceProp = 'submission_id';
                  break;
              }
              if (reassignProp && reassignSourceProp) {
                newData[reassignProp] = reviewNotifications.map((reviewNotification) => {
                  return reviewNotification.get('data')[reassignSourceProp]
                });
              }
              reviewNotifications.forEach((reviewNotification) => {
                deletes.push(reviewNotification.get('id'));
              });
              creates.push(new Notification({
                'user_id': reviewNotifications[0].get('user_id'),
                'queued': true,
                'errored': false,
                'type': newType,
                'data': newData
              }));
            }
          });
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
