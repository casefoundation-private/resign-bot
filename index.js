const web = require('./lib/web');
const database = require('./lib/database');

database.init()
  .then(() => web.init())
  .then(() => {
    console.log('Running');
  })
  .catch((err) => {
    console.error(err);
  })
