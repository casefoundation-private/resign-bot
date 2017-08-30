const User = require('../models/user');
const jwt = require('jsonwebtoken');

const finishLogin = (user,res) => {
  const payload = {
    'id': user.get('id')
  }
  const token = jwt.sign(payload,process.env.JWT_SECRET || 'secret');
  res.send({
    'message': 'ok',
    'token': token
  });
}

exports.login = (req,res,next) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user && user.verifyPassword(req.body.password)) {
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

exports.getUser = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).view) {
    res.json(req._user.toJSON());
  } else {
    res.sendStatus(401);
  }
}

exports.saveUser = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).edit) {
    if (req.body.password) {
      req._user.setPassword(req.body.password);
    }
    req._user.save()
      .then(() => {
        res.json(req._user.toJSON());
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.send(401);
  }
}
