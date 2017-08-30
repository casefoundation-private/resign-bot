const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.login = (req,res,next) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user && user.verifyPassword(req.body.password)) {
        const payload = {
          'id': user.get('id')
        }
        const token = jwt.sign(payload,process.env.JWT_SECRET || 'secret');
        res.send({
          'message': 'ok',
          'token': token
        });
      } else {
        res.status(401);
        next(new Error('Account not found or password invalid.'));
      }
    })
    .catch((err) => {
      next(err);
    });
}

exports.reset = (req,res,next) => {
  //TODO
}

exports.getUser = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).view) {
    res.json(req._user.toJSON());
  } else {
    res.send(401);
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
