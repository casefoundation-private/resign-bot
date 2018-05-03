const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)
const jsonColumns = require('bookshelf-json-columns')
bookshelf.plugin(jsonColumns)

const Configuration = module.exports = bookshelf.Model.extend({
  'tableName': 'configurations',
  'hasTimestamps': true,
  'initialize': function () {
    this.on('updating', function () {
      if (this.isImporterConfig() && this.previous('value') !== JSON.stringify(this.get('value'))) {
        Configuration.needsImportReInit = true
      }
    }, this)
    bookshelf.Model.prototype.initialize.apply(this, arguments)
  },
  'isImporterConfig': function () {
    return ['suspendImporting', 'importInterval', 'importPauses'].indexOf(this.get('key')) >= 0
  },
  'getReadable': function () {
    const value = this.get('value')
    if (typeof value.raw !== 'undefined') {
      return typeof value.raw === 'boolean' ? value.raw : (value.raw || null)
    } else {
      return value
    }
  }
}, {
  'jsonColumns': ['value'],
  'staticConfiguration': null,
  'loadStatic': function () {
    return Configuration
      .allMapped()
      .then(mapped => {
        Configuration.staticConfiguration = mapped
      })
  },
  'needsImportReInit': false,
  'getConfig': function (key) {
    return Configuration.staticConfiguration[key]
  },
  'defaultConfigurations': {
    perPage: 50,
    pinnedLimit: null,
    reviewLimit: null,
    review: {
      prompts: [],
      categories: []
    },
    reviewsPerSubmission: 1,
    helpText: '<strong>Welcome to Review-o-Matic!</strong>',
    allowedPublicSubmissionOrigins: [],
    submissionPublicReadAccess: false,
    submissionPublicWriteAccess: false,
    urlRoot: 'https://' + process.env.HEROKU_APP_NAME + '.heroku.com',
    suspendImporting: false,
    importInterval: 1000 * 60 * 60,
    importPauses: [],
    mailFrom: process.env.ADMIN_EMAIL || 'admin@' + process.env.HEROKU_APP_NAME + '.heroku.com'
  },
  'allMapped': function () {
    return Configuration
      .forge()
      .fetchAll()
      .then((configs) => {
        const map = {}
        configs.forEach(config => {
          map[config.get('key')] = config.getReadable()
        })
        return Object.assign({}, Configuration.defaultConfigurations, map)
      })
  },
  'updateConfigByKey': function (key, value) {
    if (typeof value !== 'object') {
      value = {
        raw: value && typeof value !== 'undefined' && typeof value !== 'boolean' && (value + '').trim().length === 0 ? null : value
      }
    } else if (!value) {
      value = {}
    }
    return Configuration
      .forge()
      .query({
        where: {
          key
        }
      })
      .fetch()
      .then((config) => {
        if (config) {
          config.set('value', value)
          return config.save()
        } else {
          return new Configuration({
            key,
            value
          }).save()
        }
      })
  },
  'saveMapped': function (map) {
    Configuration.needsImportReInit = false
    const jobs = []
    for (let key in map) {
      jobs.push(this.updateConfigByKey(key, map[key]))
    }
    return Promise.all(jobs)
      .then(() => this.loadStatic())
      .then(() => {
        if (Configuration.needsImportReInit) {
          return require('../importer').init(false)
        }
        Configuration.needsImportReInit = false
      })
  }
})
