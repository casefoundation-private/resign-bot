const importer = require('../importer');

exports.getPause = (req,res,next) => {
  if (req.user.isAdmin()) {
    res.send({
      'paused': importer.isPaused()
    });
  } else {
    res.send(401);
  }
}

exports.setPause = (req,res,next) => {
  if (req.user.isAdmin()) {
    importer.setPaused(JSON.parse(req.body.paused));
    exports.getPause(req,res,next);
  } else {
    res.send(401);
  }
}
