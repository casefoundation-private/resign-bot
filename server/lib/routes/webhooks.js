const importer = require('../importer')

exports.wufoo = (req, res, next) => {
  if (req.body.HandshakeKey === process.env.WUFOO_HANDSHAKE_KEY) {
    importer.runImporters().catch((err) => {
      console.log(err)
    })
    res.sendStatus(200)
  } else {
    res.sendStatus(401)
  }
}
