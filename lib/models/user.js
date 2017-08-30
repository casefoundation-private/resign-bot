const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf.Model.extend({
  'tableName': 'users',
  'hasTimestamps': true,
  'verifyPassword': function(password) {
    return this.get('password') === password; //TODO
  },
  'setPassword': function(password) {
    //TODO
    this.set('password',password)
  }
}, {
  'byEmail': function(email) {
    return this.forge().query({where:{ email: email }}).fetch()
  },
  'byId': function(id) {
    return this.forge().query({where:{ id: id }}).fetch()
  },
  'nextAvailableUser': function() {
    const userIdent = knex.raw('??', ['users.id']);
    const subquery = knex('reviews').count('*').where('user',userIdent).whereNull('score');
    const query = knex
      .select('*',subquery.as('queueSize'))
      .from('users')
      .orderBy('queueSize')
      .limit(1);
    return query
      .then((users) => {
        if (users && users.length > 0) {
          return this.byId(users[0].id);
        } else {
          return null;
        }
      });
  }
});
