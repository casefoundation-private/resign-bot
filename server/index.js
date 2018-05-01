require('dotenv').config()
const web = require('./lib/web')
const database = require('./lib/database')
const User = require('./lib/models/user')
const Configuration = require('./lib/models/configuration')
const notifications = require('./lib/notifications')
const importer = require('./lib/importer')

database.init()
  .then(() => Configuration.loadStatic())
  .then(() => User.seedAdmin())
  .then(() => {
    return Promise.all([
      notifications.init(),
      importer.init(),
      web.init(true)
    ])
  })
  .then(() => {
    console.log('Running')
  })
  .catch((err) => {
    console.error(err)
  })
