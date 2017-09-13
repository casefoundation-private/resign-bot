['review','submission','user','favorite'].forEach((lib) => {
  exports[lib] = require('./'+lib);
})
