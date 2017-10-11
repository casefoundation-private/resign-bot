const pgConfig = {
  'host' : process.env.DB_HOST,
  'user' : process.env.DB_USERNAME,
  'password' : process.env.DB_PASSWORD,
  'database' : process.env.DB_DATABASE
}

const sqliteConfig = {
  'filename': './database.sqlite'
}

const testSqliteConfig = {
  'filename': './database_test.sqlite'
}

const knex = exports.knex = require('knex')({
  'client': process.env.NODE_ENV === 'test' || process.env.DB === 'sqlite' ? 'sqlite3' : 'pg',
  'connection': process.env.NODE_ENV === 'test' ? testSqliteConfig : (process.env.DB === 'sqlite' ? sqliteConfig : pgConfig),
  'useNullAsDefault': true
});

const defaultNotificationPreferences = {
  'review_assigned': true,
  'multiple_reviews_assigned': true,
  'submission_created': true,
  'multiple_submissions_created': true
};

exports.init = () => {
  return knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', function(table) {
        table.increments('id').primary().notNullable();
        table.string('email',255).unique().notNullable();
        table.string('password',64).notNullable();
        table.string('role',16).notNullable().defaultTo('user');
        table.string('resetCode',36);
        table.datetime('resetExpiration');
        table.boolean('active').notNullable().defaultTo(true);
        table.boolean('ready').notNullable().defaultTo(true);
        table.json('notificationPreferences').notNullable().defaultTo(JSON.stringify(defaultNotificationPreferences));
        table.timestamps();
      });
    } else {
      return knex.schema.hasColumn('users','notificationPreferences')
        .then((hasNotificationPreferences) => {
          if (!hasNotificationPreferences) {
            return knex.schema.alterTable('users', function(table) {
              table.json('notificationPreferences').notNullable().defaultTo(JSON.stringify(defaultNotificationPreferences));
            });
          }
        });
    }
  }).then(() => {
    return knex.schema.hasTable('submissions').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('submissions', function(table) {
          table.increments('id').primary().notNullable();
          table.string('external_id',128).index();
          table.string('source',255).notNullable();
          table.string('ip',64).notNullable().defaultTo('localhost');
          table.json('data').notNullable();
          table.boolean('pinned').notNullable().defaultTo(false);
          table.boolean('flagged').notNullable().defaultTo(false);
          table.boolean('autoFlagged').notNullable().defaultTo(false);
          table.boolean('embargoed').notNullable().defaultTo(false);
          table.timestamps();
        });
      } else {
        return knex.schema.hasColumn('submissions','autoFlagged')
          .then((hasAutoFlagged) => {
            if (!hasAutoFlagged) {
              return knex.schema.alterTable('submissions', function(table) {
                table.boolean('autoFlagged').notNullable().defaultTo(false);
              });
            }
          })
          .then(() => {
            return knex.schema.hasColumn('submissions','embargoed')
          })
          .then((hasEmbargoed) => {
            if (!hasEmbargoed) {
              return knex.schema.alterTable('submissions', function(table) {
                table.boolean('embargoed').notNullable().defaultTo(false);
              });
            }
          })
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
          table.boolean('flagged').notNullable().defaultTo(false);
          table.json('data').notNullable().defaultTo('{}');
          table.timestamps();
          table.unique(['user_id','submission_id']);
        });
      }
    })
  }).then(() => {
    return knex.schema.hasTable('notifications').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('notifications', function(table) {
          table.increments('id').primary().notNullable();
          table.integer('user_id').references('id').inTable('users').notNullable();
          table.boolean('queued').notNullable().defaultTo(true);
          table.string('type',32).notNullable();
          table.boolean('errored').notNullable().defaultTo(false);
          table.json('data').notNullable().defaultTo('{}');
          table.timestamps();
        });
      }
    })
  }).then(() => {
    return knex.schema.hasTable('favorites').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('favorites', function(table) {
          table.increments('id').primary().notNullable();
          table.integer('user_id').references('id').inTable('users').notNullable();
          table.integer('submission_id').references('id').inTable('submissions').notNullable();
          table.timestamps();
          table.unique(['user_id','submission_id']);
        });
      }
    })
  });
}
