const pgConfig = {

}

const sqliteConfig = {
  'filename': './database.sqlite'
}

const knex = exports.knex = require('knex')({
  'client': process.env.NODE_ENV === 'test' ? 'sqlite3' : 'pg',
  'connection': process.env.NODE_ENV === 'test' ? sqliteConfig : pgConfig,
  'useNullAsDefault': true
});

exports.init = () => {
  return knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', function(table) {
        table.increments('id').primary().notNullable();
        table.string('email',255).index().notNullable();
        table.string('password',64).notNullable();
        table.string('role',16).notNullable().defaultTo('user');
        table.string('resetHash',36);
        table.datetime('resetDate');
        table.timestamps();
      });
    }
  }).then(() => {
    return knex.schema.hasTable('submissions').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('submissions', function(table) {
          table.increments('id').primary().notNullable();
          table.string('source',255).notNullable();
          table.string('ip',64).notNullable();
          table.json('data').notNullable();
          table.timestamps();
        });
      }
    })
  }).then(() => {
    return knex.schema.hasTable('reviews').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('reviews', function(table) {
          table.increments('id').primary().notNullable();
          table.integer('user_id').references('id').inTable('users').notNullable();
          table.integer('submission_id').references('id').inTable('submissions').notNullable();
          table.double('score');
          table.json('data').notNullable().defaultTo('{}');
          table.timestamps();
          table.unique(['user_id','submission_id']);
        });
      }
    })
  });
}
