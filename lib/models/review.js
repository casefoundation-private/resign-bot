const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const User = require('./user');
const Submission = require('./submission');
const jsonColumns = require('bookshelf-json-columns');
bookshelf.plugin(jsonColumns);

module.exports = bookshelf.Model.extend({
  'tableName': 'reviews',
  'hasTimestamps': true,
  'user': function() {
    return this.hasOne(User);
  },
  'submission': function() {
    return this.hasOne(Submission);
  },
  'reassign': function(user) {
    if (typeof user === 'object') {
      user = user.id
    }
    this.user = user
    return this;
  }
}, {
  'jsonColumns': ['data'],
  'reviewForUserAndSubmission': function(user,submission) {
    let userId;
    let submissionId;
    if (typeof user === 'object') {
      userId = user.id;
    } else {
      userId = user;
    }
    if (typeof submission === 'object') {
      submissionId = submission.id;
    } else {
      submissionId = submission;
    }
    return this
      .forge()
      .query({
        'where': {
          'user': userId,
          'submission': submissionId
        }
      })
      .fetch();
  },
  'getQueueForUser': function(user) {
    if (typeof user == 'object') {
      user = user.id
    }
    return this
      .forge()
      .query({
        'where': {
          'user': user,
          'score': null
        }
      })
      .orderBy('created_at','DESC')
      .fetchAll()
  },
  'byId': function(id) {
    return this.forge().query({where:{ id: id }}).fetch()
  }
});
