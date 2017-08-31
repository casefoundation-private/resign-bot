const web = require('./lib/web');
const database = require('./lib/database');
const User = require('./lib/models/user');
const notifications = require('./lib/notifications');
const importer = require('./lib/importer');

database.init()
  .then(() => web.init(true))
  .then(() => notifications.init())
  .then(() => importer.init())
  .then(() => User.seedAdmin())
  .then(() => {
    console.log('Running');
  })
  .catch((err) => {
    console.error(err);
  })
