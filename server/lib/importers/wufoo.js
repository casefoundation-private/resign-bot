const request = require('request-promise-native')
const Submission = require('../models/submission')
const Configuration = require('../models/configuration')

module.exports = () => {
  return getFormFields()
    .then((fieldMap) => getEntries(fieldMap))
}

const ignoreFields = [
  'Entry Id',
  'Date Created',
  'Created By',
  'Updated By'
]

const wufooRequest = (method, qs) => {
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

const getFormFields = () => {
  return wufooRequest('forms/' + Configuration.getConfig('wufooFormId') + '/fields')
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

const getEntries = (fieldMap) => {
  const allEntries = []
  const makeRequest = (page) => {
    const pageSize = 100
    return wufooRequest('forms/' + Configuration.getConfig('wufooFormId') + '/entries', {
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
            submissionData.data[fieldMap[fieldKey]] = cleanString(entry[fieldKey])
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

const cleanString = (str) => {
  if (str && typeof str === 'string') {
    return str.replace(/\\/g, '')
  }
  return str
}
