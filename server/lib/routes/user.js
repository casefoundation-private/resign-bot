const User = require('../models/user');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

const finishLogin = (user,res) => {
  const payload = {
    'id': user.get('id')
  }
  const token = jwt.sign(payload,process.env.JWT_SECRET || 'secret');
  res.send({
    'message': 'ok',
    'token': token,
    'id': user.get('id')
  });
}

exports.login = (req,res,next) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user && user.get('active') && user.verifyPassword(req.body.password)) {
        finishLogin(user,res);
      } else {
        res.status(401);
        next(new Error('Account not found or password invalid.'));
      }
    })
    .catch((err) => {
      next(err);
    });
}

exports.startReset = (req,res,next) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user) {
        return user.resetAccount().then(() => {
          res.send({'message': 'Please check your email for reset instructions.'});
        });
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      next(err);
    });
}

exports.completeReset = (req,res,next) => {
  if (req.params.code) {
    User.byCode(req.params.code)
      .then((user) => {
        if (user) {
          user.set({
            'resetCode': null,
            'resetExpiration': null
          });
          return user.save().then(() => {
            finishLogin(user,res);
          });
        } else {
          res.sendStatus(404);
        }
      });
  } else {
    res.sendStatus(401);
  }
}

exports.getUsers = (req,res,next) => {
  User.all()
    .then((users) => {
      res.json(users.filter((user) => {
        return req.user.getUserPermissions(user).view;
      }).map((object) => {
        object.related('reviews');
        return object.toJSON();
      }));
    });
}

exports.getUser = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).view) {
    req._user.related('reviews');
    res.json(req._user.toJSON());
  } else {
    res.sendStatus(401);
  }
}

exports.getUserReviews = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).view) {
    req._user.fetch({'withRelated':['reviews','reviews.submission']}).then(() => {
      res.json(req._user.related('reviews').filter((review) => {
        return req.user.getReviewPermissions(review).view;
      }).map((object) => {
        return object.toJSON();
      }));
    }).catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
}

exports.saveUser = (req,res,next) => {
  const saveUser = (user) => {
    if (req.body.password && req.body.password.trim().length > 0) {
      user.setPassword(req.body.password);
    }
    user.save()
      .then(() => {
        res.json(user.toJSON());
      })
      .catch((err) => {
        next(err);
      });
  }
  if (!req._user && req.user.isAdmin()) {
    const user = new User({
      'email': req.body.email,
      'role': req.body.role,
      'password': randomstring.generate(),
      'active': true,
      'ready': true
    });
    saveUser(user);
  } else if (req._user && req.user.getUserPermissions(req._user).edit) {
    if (req.user.isAdmin()) {
      if (req.body.email) {
        req._user.set('email',req.body.email);
      }
      if (req.body.role) {
        req._user.set('role',req.body.role);
      }
      if (req.body.active === true || req.body.active === false) {
        req._user.set('active',req.body.active);
      }
      if (req.body.ready === true || req.body.ready === false) {
        req._user.set('ready',req.body.ready); //TODO test
      }
    }
    saveUser(req._user);
  } else {
    res.send(401);
  }
}

exports.reassignUserReviews = (req,res,next) => { //TODO test
  if (req._user && req.user.isAdmin()) {
    req._user.recuseAllReviews()
      .then((user) => {
        res.json(req._user.toJSON());
      })
      .catch((err) => next(err));
  } else {
    res.send(401);
  }
}
