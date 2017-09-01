const Submission = require('./models/submission');

const importers = [];

exports.init = () => {
  setupImporters();
  setInterval(() => {
    runImporters().catch((err) => console.log(err))
  },(parseInt(process.env.IMPORT_INTERVAL) || (1000 * 60 * 60)));
  return runImporters();
}

const setupImporters = () => {
  if (process.env.WUFOO_KEY) {
    importers.push(require('./importers/wufoo'));
  }
}

const runImporters = () => {
  console.log('Starting import batch');
  const nextImporter = (i) => {
    if (i < importers.length) {
      return importers[i]()
        .then((newSubmissions) => saveSubmissions(newSubmissions))
        .then(() => nextImporter(i+1));
    }
  }
  return nextImporter(0).then(() => {
    console.log('Done import batch');
  });
}

const saveSubmissions = (newSubmissions) => {
  const nextSubmission = (i) => {
    if (i < newSubmissions.length) {
      const submissionData = newSubmissions[i];
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
        .then(() => nextSubmission(i+1));
    }
  }
  return nextSubmission(0);
}
