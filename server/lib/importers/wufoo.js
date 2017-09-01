const request = require('request-promise-native');

module.exports = () => {
  return getFormFields()
    .then((fieldMap) => getEntries(fieldMap));
}

const ignoreFields = [
  'Entry Id',
  'Date Created',
  'Created By',
  'Updated By'
];

const wufooRequest = (method,qs) => {
  return request({
    'uri': 'https://' + process.env.WUFOO_SUBDOMAIN + '.wufoo.com/api/v3/' + method + '.json',
    'auth': {
      'user': process.env.WUFOO_KEY,
      'pass': 'anything',
      'sendImmediately': true
    },
    'json': true,
    'useQuerystring': true,
    'qs': qs || {}
  });
}

const getFormFields = () => {
  return wufooRequest('forms/' + process.env.WUFOO_FORM_ID + '/fields')
    .then((body) => {
      if (body.Fields) {
        const fieldMap = {};
        body.Fields.forEach((field) => {
          if (ignoreFields.indexOf(field.Title) < 0) {
            fieldMap[field.ID] = field.Title;
          }
        });
        return fieldMap;
      } else {
        throw new Error('No fields returned from Wufoo');
      }
    });
}

const getEntries = (fieldMap) => {
  const allEntries = [];
  const makeRequest = (page) => {
    const pageSize = 100;
    return wufooRequest('forms/' + process.env.WUFOO_FORM_ID + '/entries',{
      'pageSize': pageSize,
      'pageStart': (pageSize * page)
    }).then((entrySet) => {
      if (entrySet.Entries && entrySet.Entries.length > 0) {
        entrySet.Entries.forEach((entry) => {
          const submissionData = {
            'source': 'wufoo_' + process.env.WUFOO_SUBDOMAIN + '_' + process.env.WUFOO_FORM_ID,
            'data': {},
            'external_id': entry.EntryId,
            'created_at': new Date(Date.parse(entry.DateCreated))
          };
          for(var fieldKey in fieldMap) {
            submissionData.data[fieldMap[fieldKey]] = entry[fieldKey];
          }
          allEntries.push(submissionData);
        });
        return makeRequest(page+1);
      } else {
        console.log('Got back ' + allEntries.length + ' fields from Wufoo');
        return allEntries;
      }
    })
  }
  return makeRequest(0);
}
