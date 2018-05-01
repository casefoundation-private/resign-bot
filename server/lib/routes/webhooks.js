const importer = require('../importer')
const Configuration = require('../models/configuration')

exports.wufoo = (req, res, next) => {
  if (req.body.HandshakeKey === Configuration.getConfig('wufooHandshakeKey')) {
    importer.runImporters().catch((err) => {
      console.log(err)
    })
    res.sendStatus(200)
  } else {
    res.sendStatus(401)
  }
}
