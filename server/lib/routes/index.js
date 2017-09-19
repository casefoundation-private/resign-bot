['review','submission','user','config','notification'].forEach((lib) => {
  exports[lib] = require('./'+lib);
})
