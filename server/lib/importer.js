const Submission = require('./models/submission');

const importers = [];

exports.init = () => {
  setupImporters();
  setInterval(() => {
    runImporters();
  },(parseInt(process.env.IMPORT_INTERVAL) || (1000 * 60 * 60 * 12)));
  return runImporters();
}

const setupImporters = () => {
  if (process.env.WUFOO_KEY) {
    importers.push(require('./importers/wufoo'));
  }
}

const runImporters = () => {
  console.log('Starting import batch');
  return Promise.all(importers.map((importer) => {
    return importer()
      .then((newSubmissions) => saveSubmissions(newSubmissions));
  })).then(() => {
    console.log('Done import batch');
  })
}

const saveSubmissions = (newSubmissions) => {
  return Promise.all(newSubmissions.map((submissionData) => {
    return Submission
      .bySourceAndExternalId(submissionData.source,submissionData.external_id)
      .then((existingSubmission) => {
        if (existingSubmission) {
          console.log(existingSubmission.get('source') + '/' + existingSubmission.get('external_id') + ' is a duplicate. Skipping.');
        } else {
          const newSubmission = new Submission(submissionData);
          console.log(newSubmission.get('source') + '/' + newSubmission.get('external_id') + ' is new. Importing');
          return newSubmission.save();
        }
      })
  }))
}
