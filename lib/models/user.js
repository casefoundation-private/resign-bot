const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const bcrypt = require('bcrypt');

module.exports = bookshelf.Model.extend({
  'tableName': 'users',
  'hasTimestamps': true,
  'verifyPassword': function(password) {
    return bcrypt.compareSync(password,this.get('password'));
  },
  'setPassword': function(password) {
    this.set('password',bcrypt.hashSync(password,10));
  },
  'resetAccount': function() {
    //TODO
  },
  'isAdmin': function() {
    return this.get('role') === 'admin';
  },
  'getUserPermissions': function(user) {
    if (this.isAdmin() || user.get('id') === this.get('id')) {
      return {
        'view': true,
        'edit': true
      };
    } else {
      return {
        'view': false,
        'edit': false
      };
    }
  },
  'getReviewPermissions': function(review) {
    if (this.isAdmin() || review.get('user_id') === this.get('id')) {
      return {
        'view': true,
        'edit': true
      };
    } else {
      return {
        'view': false,
        'edit': false
      };
    }
  },
  'getSubmissionPermissions': function(submission) {
    if (this.isAdmin()) {
      return {
        'view': true,
        'edit': true
      };
    } else {
      return {
        'view': true,
        'edit': false
      };
    }
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
