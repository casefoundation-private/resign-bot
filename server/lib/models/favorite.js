const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf.Model.extend({
  'tableName': 'favorites',
  'hasTimestamps': true,
  'user': function() {
    const User = require('./user');
    return this.belongsTo(User);
  },
  'submission': function() {
    const Submission = require('./submission');
    return this.belongsTo(Submission);
  }
},{
  'bySubmissionAndUser': function(submission_id,user_id) {
    return this.forge().query({
      'where': {
        'submission_id': submission_id,
        'user_id': user_id
      }
    }).fetch();
  }
});
