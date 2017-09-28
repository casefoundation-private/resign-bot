const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const User = require('./user');
const jsonColumns = require('bookshelf-json-columns');
const Notification = require('./notification');
bookshelf.plugin(jsonColumns);

module.exports = Review = bookshelf.Model.extend({
  'tableName': 'reviews',
  'hasTimestamps': true,
  'initialize': function() {
    this.on('created',function() {
      return Notification.reviewAssigned(this).save();
    },this);
    this.on('creating',function() {
      return this.checkForReviewLimit()
        .then((limitReached) => {
          if (limitReached) {
            throw new Error('Too many reviews for this submission.');
          }
        });
    })
    this.on('updating',function() {
      const notificationUpdate = () => {
        if (this.get('user_id') != this.previous('user_id')) {
          return Notification.reviewAssigned(this).save();
        }
      }
      if (this.get('submission_id') != this.previous('submission_id')) {
        return this.checkForReviewLimit()
          .then((limitReached) => {
            if (limitReached) {
              throw new Error('Too many reviews for this submission.');
            }
          })
          .then(() => {
            return notificationUpdate();
          });
      } else {
        return notificationUpdate();
      }
    },this);
    bookshelf.Model.prototype.initialize.apply(this, arguments);
  },
  'user': function() {
    return this.belongsTo(User);
  },
  'submission': function() {
    const Submission = require('./submission');
    return this.belongsTo(Submission);
  },
  'recuse': function(failQuietly,targetUserId) { //TODO test
    if (targetUserId) {
      return Review.reviewForUserAndSubmission(targetUserId,this.get('submission_id'))
        .then((review) => {
          if (review) {
            if (failQuietly) {
              return false;
            } else {
              throw new Error('That user has or is already reviewing this submission!');
            }
          } else {
            this.set('user_id',targetUserId);
            return true;
          }
        })
    } else {
      return User.nextAvailableUsers(1,[this.get('user_id')],[this.get('submission_id')])
        .then((users) => {
          if (users && users.length > 0) {
            this.set('user_id',users.at(0).get('id'));
            return true;
          } else if (failQuietly) {
            return false;
          } else {
            throw new Error('No users ready!');
          }
        });
    }
  },
  'toJSON': function(options) {
    const sendOpts = options ? Object.assign(options,{'virtuals': true}) : {'virtuals': true};
    const json = bookshelf.Model.prototype.toJSON.apply(this,sendOpts);
    json.flagged = json.flagged === true || json.flagged === 1;
    return json;
  },
  'checkForReviewLimit': function() {
    return knex('reviews')
      .count('*')
      .where({'submission_id':this.get('submission_id')})
      .then((total) => {
        if (total[0]['count(*)'] >= parseInt(process.env.REVIEW_LIMIT)) {
          return true;
        } else {
          return false;
        }
      });
  }
}, {
  'jsonColumns': ['data'],
  'reviewForUserAndSubmission': function(user,submission) {
    let userId;
    let submissionId;
    if (typeof user === 'object') {
      userId = user.get('id');
    } else {
      userId = user;
    }
    if (typeof submission === 'object') {
      submissionId = submission.get('id');
    } else {
      submissionId = submission;
    }
    return this
      .forge()
      .query({
        'where': {
          'user_id': userId,
          'submission_id': submissionId
        }
      })
      .fetch({
        'withRelated': ['user','submission']
      });
  },
  'forSubmission': function(submission) {
    let submissionId;
    if (typeof submission === 'object') {
      submissionId = submission.get('id');
    } else {
      submissionId = submission;
    }
    return this
      .forge()
      .query({
        'where': {
          'submission_id': submissionId
        }
      })
      .fetchAll();
  },
  'getQueueForUser': function(user) {
    if (typeof user == 'object') {
      user = user.get('id')
    }
    return this
      .forge()
      .query({
        'where': {
          'user_id': user,
          'score': null
        }
      })
      .orderBy('created_at','DESC')
      .fetchAll()
  },
  'byId': function(id) {
    return this.forge().query({where:{ id: id }}).fetch({
      'withRelated': ['user','submission']
    })
  }
});
