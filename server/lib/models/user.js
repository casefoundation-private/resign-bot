const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const Notification = require('./notification');

module.exports = bookshelf.Model.extend({
  'tableName': 'users',
  'hasTimestamps': true,
  'reviews': function() {
    const Review = require('./review');
    return this.hasMany(Review);
  },
  'notifications': function() {
    return this.hasMany(Notification);
  },
  'verifyPassword': function(password) {
    return bcrypt.compareSync(password,this.get('password'));
  },
  'setPassword': function(password) {
    this.set('password',bcrypt.hashSync(password,10));
  },
  'resetAccount': function() {
    this.set('resetCode',uuidv4());
    this.set('resetExpiration', new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));
    return this.save()
      .then(() => {
        return Notification.userAccountReset(this).save();
      });
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
  'byCode': function(code) {
    return this.forge()
      .query((qb) => {
        qb.where('resetCode',code);
        qb.where('resetExpiration','>=',new Date());
      })
      .fetch()
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
