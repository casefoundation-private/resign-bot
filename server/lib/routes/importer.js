const importer = require('../importer');

exports.getEmbargoed = (req,res,next) => {
  if (req.user.isAdmin()) {
    res.send({
      'embargoed': importer.isEmbargoed()
    });
  } else {
    res.send(401);
  }
}

exports.setEmbargoed = (req,res,next) => {
  if (req.user.isAdmin()) {
    importer.setEmbargoed(JSON.parse(req.body.embargoed));
    exports.getEmbargoed(req,res,next);
  } else {
    res.send(401);
  }
}
