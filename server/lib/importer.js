const Submission = require('./models/submission');
const BadLanguageFilter = require('bad-language-filter');
const blFilter = new BadLanguageFilter();

const importers = [];
const importersByName = {};
const embargoDate = process.env.EMBARGO_DATE ? new Date(process.env.EMBARGO_DATE) : false;
let importLock = false;

exports.init = () => {
  if (!process.env.SUSPEND_IMPORTING) {
    setupImporters();
    setInterval(() => {
      runImporters().catch((err) => {
        console.log(err);
      });
    },(parseInt(process.env.IMPORT_INTERVAL) || (1000 * 60 * 60)));
    return runImporters();
  }
}

const setupImporters = () => {
  if (process.env.WUFOO_KEY) {
    importersByName.wufoo = importers.length;
    importers.push(require('./importers/wufoo'));
  }
}

const runImporters = () => {
  if (!importLock) {
    importLock = true;
    console.log('Starting import batch');
    const nextImporter = (i) => {
      if (i < importers.length) {
        return runImporter(importers[i])
          .then(() => nextImporter(i+1));
      }
    }
    return nextImporter(0).then(() => {
      console.log('Done import batch');
    })
    .then(() => {
      importLock = false;
    })
    .catch((err) => {
      importLock = false;
    });
  }
}

exports.runImporters = runImporters;

const runImporter = (importer) => {
  return importer()
    .then((newSubmissions) => saveSubmissions(newSubmissions.filter((newSubmission) => {
      if (embargoDate) {
        return newSubmission.get('created_at').getTime() > embargoDate.getTime();
      } else {
        return true;
      }
    })));
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
            let badLanguage = false;
            for(var key in newSubmission.get('data')) {
              if (blFilter.contains(newSubmission.get('data')[key])) {
                badLanguage = true;
                console.log('Flagging new submission for bad language.');
              }
            }
            newSubmission.set('flagged',JSON.parse(process.env.FLAGGED_BY_DEFAULT || false) || badLanguage);
            return newSubmission.save();
          }
        })
        .then(() => nextSubmission(i+1));
    }
  }
  return nextSubmission(0);
}
