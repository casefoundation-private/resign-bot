const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const User = require('./user');
const jsonColumns = require('bookshelf-json-columns');
const Notification = require('./notification');
bookshelf.plugin(jsonColumns);

module.exports = bookshelf.Model.extend({
  'tableName': 'reviews',
  'hasTimestamps': true,
  'initialize': function() {
    this.on('created',function() {
      return Notification.reviewAssigned(this).save();
    },this);
    bookshelf.Model.prototype.initialize.apply(this, arguments);
  },
  'user': function() {
    return this.belongsTo(User);
  },
  'submission': function() {
    const Submission = require('./submission');
    return this.belongsTo(Submission);
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
      .fetchAll({
        'withRelated': ['user','submission']
      });
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
