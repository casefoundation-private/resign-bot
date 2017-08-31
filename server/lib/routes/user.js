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

const scrubUser = (user) => {
  if (user.toJSON) {
    user = user.toJSON();
  }
  delete user.password;
  delete user.resetCode;
  delete user.resetExpiration;
  return user;
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
        return scrubUser(object);
      }));
    });
}

exports.getUser = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).view) {
    res.json(scrubUser(req._user));
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
        res.json(scrubUser(user));
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
      'active': true
    });
    saveUser(user);
  } else if (req._user && req.user.getUserPermissions(req._user).edit) {
    //TODO test
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
    }
    saveUser(req._user);
  } else {
    res.send(401);
  }
}
