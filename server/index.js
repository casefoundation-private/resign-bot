const web = require('./lib/web');
const database = require('./lib/database');
const notifications = require('./lib/notifications');

database.init()
  .then(() => web.init())
  .then(() => notifications.init())
  .then(() => {
    console.log('Running');
  })
  .catch((err) => {
    console.error(err);
  })
