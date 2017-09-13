const web = require('./lib/web');
const database = require('./lib/database');
const User = require('./lib/models/user');
const notifications = require('./lib/notifications');
const importer = require('./lib/importer');

database.init()
  .then(() => User.seedAdmin())
  .then(() => notifications.init())
  .then(() => importer.init())
  .then(() => web.init(true))
  .then(() => {
    console.log('Running');
  })
  .catch((err) => {
    console.error(err);
  })
