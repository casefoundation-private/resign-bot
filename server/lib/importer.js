const Submission = require('./models/submission');
const later = require('later');
const BadLanguageFilter = require('bad-language-filter');
const blFilter = new BadLanguageFilter();

const importers = [];
const importersByName = {};
const embargoDate = process.env.EMBARGO_DATE ? new Date(process.env.EMBARGO_DATE) : false;
let importLock = false;
let importEmbargo = false;

exports.init = () => {
  if (!process.env.SUSPEND_IMPORTING) {
    setupImporters();
    setupEmbargoSchedule();
    setInterval(() => {
      runImporters().catch((err) => {
        console.log(err);
      });
    },(parseInt(process.env.IMPORT_INTERVAL) || (1000 * 60 * 60)));
    return runImporters();
  }
}

exports.isEmbargoed = () => {
  return importEmbargo;
}

const setEmbargoed = exports.setEmbargoed = (embargoed) => {
  importEmbargo = embargoed;
  if (embargoed) {
    console.log('Importing embargoed');
  } else {
    console.log('Importing resumed; embargoed stories released');
    return Submission.embargoed()
      .then((submissions) => {
        return Promise.all(
          submissions.map((submission) => {
            submission.set('embargoed',false);
            return submission.save();
          })
        )
      });
  }
}

const setupImporters = () => {
  if (process.env.WUFOO_KEY) {
    importersByName.wufoo = importers.length;
    importers.push(require('./importers/wufoo'));
  }
}

const setupEmbargoSchedule = () => {
  const scheduleEmbargo = (embargoStartString,embargoLength) => {
    const schedule = later
      .parse
      .cron(embargoStartString);
    later.setInterval(() => {
      setEmbargoed(true);
      setTimeout(() => {
        setEmbargoed(false);
      },embargoLength)
    },schedule);
  }
  const embargos = parseInt(process.env.IMPORT_PAUSES || 0);
  for(var i = 0; i < embargos; i++) {
    const embargoStartString = process.env['IMPORT_PAUSE_' + i + '_START'];
    const embargoLength = parseInt(process.env['IMPORT_PAUSE_' + i + '_LENGTH']);
    scheduleEmbargo(embargoStartString,embargoLength);
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
              if (blFilter.contains(' ' + newSubmission.get('data')[key] + ' ')) {
                badLanguage = true;
                console.log('Flagging new submission for bad language.');
              }
            }
            newSubmission.set('autoFlagged',badLanguage);
            newSubmission.set('embargoed',importEmbargo);
            return newSubmission.save();
          }
        })
        .then(() => nextSubmission(i+1));
    }
  }
  return nextSubmission(0);
}
