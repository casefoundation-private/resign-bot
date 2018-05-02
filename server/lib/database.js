const config = {
  sqlite3: {
    filename: process.env.DATABASE_FILE_PATH || './database.sqlite'
  },
  pg: {
    connectionString: process.env.DATABASE_URL
  }
}

const driver = process.env.DB || 'sqlite3'

const testSqliteConfig = {
  filename: './database_test.sqlite'
}

const knex = exports.knex = require('knex')({
  client: process.env.NODE_ENV === 'test' ? 'sqlite' : driver,
  connection: process.env.NODE_ENV === 'test' ? testSqliteConfig : config[driver],
  useNullAsDefault: true
})

const defaultNotificationPreferences = {
  'review_assigned': true,
  'multiple_reviews_assigned': true,
  'submission_created': true,
  'multiple_submissions_created': true
}

exports.init = () => {
  return knex.schema.hasTable('users').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('users', function (table) {
        table.increments('id').primary().notNullable()
        table.string('email', 255).unique().notNullable()
        table.string('password', 64).notNullable()
        table.string('role', 16).notNullable().defaultTo('user')
        table.string('resetCode', 36)
        table.datetime('resetExpiration')
        table.boolean('active').notNullable().defaultTo(true)
        table.boolean('ready').notNullable().defaultTo(true)
        table.json('notificationPreferences').notNullable().defaultTo(JSON.stringify(defaultNotificationPreferences))
        table.timestamps()
      })
    }
  }).then(() => {
    return knex.schema.hasTable('submissions').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('submissions', function (table) {
          table.increments('id').primary().notNullable()
          table.string('external_id', 128).index()
          table.string('source', 255).notNullable()
          table.string('ip', 64).notNullable().defaultTo('localhost')
          table.json('data').notNullable()
          table.boolean('pinned').notNullable().defaultTo(false)
          table.boolean('flagged').notNullable().defaultTo(false)
          table.boolean('autoFlagged').notNullable().defaultTo(false)
          table.boolean('embargoed').notNullable().defaultTo(false)
          table.timestamps()
        })
      }
    })
  }).then(() => {
    return knex.schema.hasTable('reviews').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('reviews', function (table) {
          table.increments('id').primary().notNullable()
          table.integer('user_id').references('id').inTable('users').notNullable()
          table.integer('submission_id').references('id').inTable('submissions').notNullable()
          table.double('score')
          table.boolean('flagged').notNullable().defaultTo(false)
          table.json('data').notNullable().defaultTo('{}')
          table.timestamps()
          table.unique(['user_id', 'submission_id'])
        })
      }
    })
  }).then(() => {
    return knex.schema.hasTable('notifications').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('notifications', function (table) {
          table.increments('id').primary().notNullable()
          table.integer('user_id').references('id').inTable('users').notNullable()
          table.boolean('queued').notNullable().defaultTo(true)
          table.string('type', 32).notNullable()
          table.boolean('errored').notNullable().defaultTo(false)
          table.json('data').notNullable().defaultTo('{}')
          table.timestamps()
        })
      }
    })
  }).then(() => {
    return knex.schema.hasTable('favorites').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('favorites', function (table) {
          table.increments('id').primary().notNullable()
          table.integer('user_id').references('id').inTable('users').notNullable()
          table.integer('submission_id').references('id').inTable('submissions').notNullable()
          table.timestamps()
          table.unique(['user_id', 'submission_id'])
        })
      }
    })
  }).then(() => {
    return knex.schema.hasTable('configurations').then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('configurations', function (table) {
          table.increments('id').primary().notNullable()
          table.string('key', 255).unique().notNullable()
          table.json('value').notNullable().defaultTo('{}')
          table.timestamps()
        })
      }
    })
  })
}
