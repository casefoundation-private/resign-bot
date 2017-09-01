const knex = require('../database').knex;
const bookshelf = require('bookshelf')(knex);
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const Notification = require('./notification');
const randomstring = require('randomstring');

const User = module.exports = bookshelf.Model.extend({
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
  },
  'toJSON': function(options) {
    const json = this.serialize(options);
    delete json.password;
    delete json.resetCode;
    delete json.resetExpiration;
    return json;
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
    return this.forge().query({where:{ id: id }}).fetch();
  },
  'all': function() {
    return this.forge().fetchAll();
  },
  'nextAvailableUser': function() {
    return User.forge()
      .query((qb) => {
        qb.whereNotIn('id',knex.select('user_id').from('reviews').whereNull('reviews.score'));
      })
      .fetch()
      .then((user) => {
        if (user) {
          return user;
        } else {
          return knex.select(knex.raw('users.id, sum(reviews.user_id) as totalReviews'))
            .from('users')
            .leftJoin('reviews','users.id','reviews.user_id')
            .whereNull('reviews.score')
            .groupBy('reviews.user_id')
            .orderBy('totalReviews')
            .limit(1)
            .then((result) => {
              if (result && result.length > 0) {
                return User.byId(result[0].id);
              }
            });
        }
      });
  },
  'seedAdmin': function() {
    return this.forge()
      .query({'where':{'role':'admin'}})
      .fetchAll()
      .then((users) => {
        if (!users || users.length == 0) {
          const user = new User({
            'email': 'johnj@casefoundation.org',
            'role': 'admin',
            'active': true
          });
          const password = randomstring.generate();
          user.setPassword(password)
          return user.save().then(() => {
            console.log('Seeded an admin user:\nEmail: ' + user.get('email') + '\nPassword: ' + password);
          });
        }
      });
  }
});
