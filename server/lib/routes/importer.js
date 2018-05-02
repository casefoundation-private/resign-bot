const importer = require('../importer')
const Import = require('../models/import')
const FileImporter = require('../importers/fileImporter')

exports.getEmbargoed = (req, res, next) => {
  if (req.user.isAdmin()) {
    res.send({
      'embargoed': importer.isEmbargoed()
    })
  } else {
    res.send(401)
  }
}

exports.setEmbargoed = (req, res, next) => {
  if (req.user.isAdmin()) {
    importer.setEmbargoed(JSON.parse(req.body.embargoed))
    exports.getEmbargoed(req, res, next)
  } else {
    res.send(401)
  }
}

exports.getImports = (req, res, next) => {
  if (req.user.isAdmin()) {
    Import.all()
      .then(imports => res.send(imports.toJSON()))
      .catch(err => next(err))
  } else {
    res.sendStatus(401)
  }
}

exports.runImport = (req, res, next) => {
  if (req.user.isAdmin() && req.file) {
    const fileString = req.file.buffer.toString('utf8')
    const importer = new FileImporter(req.file.originalname, fileString)
    importer.run()
      .then(() => {
        res.send({message: 'ok'})
      })
      .catch(err => next(err))
  } else {
    res.sendStatus(400)
  }
}
