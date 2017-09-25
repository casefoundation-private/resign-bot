['review','submission','user','config','notification','webhooks'].forEach((lib) => {
  exports[lib] = require('./'+lib);
})
