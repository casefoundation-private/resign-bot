const request = require('request-promise-native')
const Submission = require('../models/submission')
const Configuration = require('../models/configuration')
const Importer = require('./importer')

const ignoreFields = [
  'Entry Id',
  'Date Created',
  'Created By',
  'Updated By'
]

class Wufoo extends Importer {
  isReady () {
    return Configuration.getConfig('wufooSubdomain') !== null && Configuration.getConfig('wufooFormId') !== null && Configuration.getConfig('wufooApiKey') !== null
  }

  fetchData () {
    return this.getFormFields()
      .then((fieldMap) => this.getEntries(fieldMap))
  }

  getFormFields () {
    return this.wufooRequest('forms/' + Configuration.getConfig('wufooFormId') + '/fields')
      .then((body) => {
        if (body.Fields) {
          const fieldMap = {}
          body.Fields.forEach((field) => {
            if (ignoreFields.indexOf(field.Title) < 0) {
              fieldMap[field.ID] = field.Title
            }
          })
          return fieldMap
        } else {
          throw new Error('No fields returned from Wufoo')
        }
      })
  }

  wufooRequest (method, qs) {
    return request({
      'uri': 'https://' + Configuration.getConfig('wufooSubdomain') + '.wufoo.com/api/v3/' + method + '.json',
      'auth': {
        'user': Configuration.getConfig('wufooApiKey'),
        'pass': 'anything',
        'sendImmediately': true
      },
      'json': true,
      'useQuerystring': true,
      'qs': qs || {}
    })
  }

  getEntries (fieldMap) {
    const allEntries = []
    const makeRequest = (page) => {
      const pageSize = 100
      return this.wufooRequest('forms/' + Configuration.getConfig('wufooFormId') + '/entries', {
        'pageSize': pageSize,
        'pageStart': (pageSize * page)
      }).then((entrySet) => {
        if (entrySet.Entries && entrySet.Entries.length > 0) {
          entrySet.Entries.forEach((entry) => {
            const submissionData = {
              'source': 'wufoo_' + Configuration.getConfig('wufooSubdomain') + '_' + Configuration.getConfig('wufooFormId'),
              'data': {},
              'external_id': entry.EntryId,
              'created_at': new Date(Date.parse(entry.DateCreated))
            }
            for (var fieldKey in fieldMap) {
              submissionData.data[fieldMap[fieldKey]] = this.cleanString(entry[fieldKey])
            }
            allEntries.push(new Submission(submissionData))
          })
          return makeRequest(page + 1)
        } else {
          console.log('Got back ' + allEntries.length + ' entries from Wufoo')
          return allEntries
        }
      })
    }
    return makeRequest(0)
  }
}

module.exports = Wufoo
