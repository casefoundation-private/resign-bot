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

//TODO auth
exports.getUser = (req,res,next) => {
  res.json(req._user.toJSON());
}

//TODO auth
exports.saveUser = (req,res,next) => {
  if (req.body.password) {
    req._user.setPassword(req.body.password);
  }
  req._user.save()
    .then(() => {
      res.json(req._user.toJSON());
    })
    .catch((err) => {
      next(err);
    })
}
