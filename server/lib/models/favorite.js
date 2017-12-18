const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf.Model.extend({
  'tableName': 'favorites',
  'hasTimestamps': true,
  'user': function () {
    const User = require('./user')
    return this.belongsTo(User)
  },
  'submission': function () {
    const Submission = require('./submission')
    return this.belongsTo(Submission)
  }
}, {
  'bySubmissionAndUser': function (submissionId, userId) {
    return this.forge().query({
      'where': {
        'submission_id': submissionId,
        'user_id': userId
      }
    }).fetch()
  }
})
