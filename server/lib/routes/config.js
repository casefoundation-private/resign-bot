const Configuration = require('../models/configuration')

exports.getConfig = (req, res, next) => {
  Configuration.allMapped()
    .then(configs => res.send(configs))
    .catch(err => next(err))
}

exports.saveConfig = (req, res, next) => {
  if (req.user.isAdmin()) {
    Configuration
      .saveMapped(req.body)
      .then(() => Configuration.allMapped())
      .then(configs => res.send(configs))
      .catch(err => next(err))
  } else {
    res.send(403)
  }
}
