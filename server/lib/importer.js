const Submission = require('./models/submission')
const later = require('later')
const Configuration = require('./models/configuration')
const Wufoo = require('./importers/wufoo')

let importers
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
  const wufoo = new Wufoo()
  if (wufoo.isReady()) {
    importers.push(wufoo)
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

const runImporter = (importer) => {
  return importer.run(importEmbargo)
}

exports.runImporters = runImporters
exports.runImporter = runImporter
