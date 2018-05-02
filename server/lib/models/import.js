const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf.Model.extend({
  'tableName': 'imports',
  'hasTimestamps': true
}, {
  'all': function () {
    return this.forge()
      .orderBy('created_at', 'desc')
      .fetchAll()
  }
})
