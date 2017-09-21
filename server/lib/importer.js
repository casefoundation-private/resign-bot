const Submission = require('./models/submission');

const importers = [];
const embargoDate = process.env.EMBARGO_DATE ? new Date(process.env.EMBARGO_DATE) : false;

exports.init = () => {
  if (!process.env.SUSPEND_IMPORTING) {
    setupImporters();
    setInterval(() => {
      runImporters().catch((err) => console.log(err))
    },(parseInt(process.env.IMPORT_INTERVAL) || (1000 * 60 * 60)));
    return runImporters();
  }
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
        .then((newSubmissions) => saveSubmissions(newSubmissions.filter((newSubmission) => {
          if (embargoDate) {
            return newSubmission.get('created_at').getTime() > embargoDate.getTime();
          } else {
            return true;
          }
        })))
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
      const newSubmission = newSubmissions[i];
      return Submission
        .bySourceAndExternalId(newSubmission.get('source'),newSubmission.get('external_id'))
        .then((existingSubmission) => {
          if (existingSubmission) {
            console.log(existingSubmission.get('source') + '/' + existingSubmission.get('external_id') + ' is a duplicate. Skipping.');
          } else {
            console.log(newSubmission.get('source') + '/' + newSubmission.get('external_id') + ' is new. Importing');
            return newSubmission.save();
          }
        })
        .then(() => nextSubmission(i+1));
    }
  }
  return nextSubmission(0);
}
