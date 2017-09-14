['review','submission','user','config'].forEach((lib) => {
  exports[lib] = require('./'+lib);
})
