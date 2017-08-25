const User = require('../models/user');

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
