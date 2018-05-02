const Submission = require('../models/submission')
const Import = require('../models/import')

class Importer {
  fetchData () {
    return Promise.resolve()
  }

  cleanString (str) {
    if (str && typeof str === 'string') {
      return str.replace(/\\/g, '')
    }
    return str
  }

  isReady () {
    return false
  }

  run (embargo = false) {
    return this.fetchData()
      .then(submissions => this.processSubmissions(submissions, embargo))
  }

  processSubmissions (newSubmissions, embargo) {
    const totals = {
      total: newSubmissions.length,
      new: 0,
      duplicates: 0,
      errors: 0
    }
    const nextSubmission = (i) => {
      if (i < newSubmissions.length) {
        const newSubmission = newSubmissions[i]
        return Submission
          .bySourceAndExternalId(newSubmission.get('source'), newSubmission.get('external_id'))
          .then((existingSubmission) => {
            if (existingSubmission) {
              totals.duplicates++
              console.log(existingSubmission.get('source') + '/' + existingSubmission.get('external_id') + ' is a duplicate. Skipping.')
            } else {
              console.log(newSubmission.get('source') + '/' + newSubmission.get('external_id') + ' is new. Importing')
              newSubmission.set('embargoed', embargo)
              return newSubmission.save()
                .then(() => {
                  totals.new++
                })
            }
          })
          .catch(err => {
            console.error('Error saving submission', err)
            totals.errors++
          })
          .then(() => nextSubmission(i + 1))
      }
    }
    return nextSubmission(0)
      .then(() => {
        if (totals.duplicates !== totals.total) {
          return new Import({
            importer: this.constructor.name,
            total: totals.total,
            new: totals.new,
            duplicates: totals.duplicates,
            errors: totals.errors
          }).save()
        }
      })
  }
}

module.exports = Importer
