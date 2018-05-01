const Submission = require('./models/submission')
const later = require('later')
const Configuration = require('./models/configuration')

let importers
let importersByName
let importLock = false
let importEmbargo = false
let schedules
let interval

exports.init = (firstRun = true) => {
  console.log('Setting up automated import')
  if (interval) {
    clearInterval(interval)
  }
  if (schedules) {
    schedules.forEach(schedule => schedule.clear())
  }
  if (Configuration.getConfig('suspendImporting') === false) {
    console.log('Automated import enabled')
    setupImporters()
    setupEmbargoSchedule()
    interval = setInterval(() => {
      runImporters().catch((err) => {
        console.log(err)
      })
    }, (Configuration.getConfig('importInterval') || (1000 * 60 * 60)))
    return firstRun ? runImporters() : Promise.resolve()
  } else {
    console.log('Automated import disabled')
    return Promise.resolve()
  }
}

exports.isEmbargoed = () => {
  return importEmbargo
}

const setEmbargoed = exports.setEmbargoed = (embargoed) => {
  importEmbargo = embargoed
  if (embargoed) {
    console.log('Importing embargoed')
  } else {
    console.log('Importing resumed; embargoed stories released')
    return Submission.embargoed()
      .then((submissions) => {
        return Promise.all(
          submissions.map((submission) => {
            submission.set('embargoed', false)
            return submission.save()
          })
        )
      })
  }
}

const setupImporters = () => {
  importers = []
  importersByName = {}
  if (Configuration.getConfig('wufooApiKey')) {
    importersByName.wufoo = importers.length
    importers.push(require('./importers/wufoo'))
  }
}

const setupEmbargoSchedule = () => {
  const scheduleEmbargo = (embargoStartString, embargoLength) => {
    const schedule = later
      .parse
      .cron(embargoStartString)
    return later.setInterval(() => {
      setEmbargoed(true)
      setTimeout(() => {
        setEmbargoed(false)
      }, embargoLength)
    }, schedule)
  }
  schedules = Configuration.getConfig('importPauses').map(pause => {
    const embargoStartString = pause.start
    const embargoLength = pause.length
    return scheduleEmbargo(embargoStartString, embargoLength)
  })
}

const runImporters = () => {
  if (!importLock) {
    importLock = true
    console.log('Starting import batch')
    const nextImporter = (i) => {
      if (i < importers.length) {
        return runImporter(importers[i])
          .then(() => nextImporter(i + 1))
      } else {
        return Promise.resolve()
      }
    }
    return nextImporter(0).then(() => {
      console.log('Done import batch')
    })
      .then(() => {
        importLock = false
      })
      .catch((err) => {
        importLock = false
        console.error(err)
      })
  }
}

exports.runImporters = runImporters

const runImporter = (importer) => {
  return importer()
    .then((newSubmissions) => saveSubmissions(newSubmissions))
}

const saveSubmissions = (newSubmissions) => {
  const nextSubmission = (i) => {
    if (i < newSubmissions.length) {
      const newSubmission = newSubmissions[i]
      return Submission
        .bySourceAndExternalId(newSubmission.get('source'), newSubmission.get('external_id'))
        .then((existingSubmission) => {
          if (existingSubmission) {
            console.log(existingSubmission.get('source') + '/' + existingSubmission.get('external_id') + ' is a duplicate. Skipping.')
          } else {
            console.log(newSubmission.get('source') + '/' + newSubmission.get('external_id') + ' is new. Importing')
            newSubmission.set('embargoed', importEmbargo)
            return newSubmission.save()
          }
        })
        .then(() => nextSubmission(i + 1))
    }
  }
  return nextSubmission(0)
}
