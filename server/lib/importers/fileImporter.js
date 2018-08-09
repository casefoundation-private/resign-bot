const path = require('path')
const csvParse = require('csv-parse')
const Submission = require('../models/submission')
const Importer = require('./importer')

class FileImporter extends Importer {
  constructor (filename, fileContents) {
    super()
    this.filename = filename
    this.fileContents = fileContents
  }

  isReady () {
    return this.filename && this.filename.trim().length !== 0 && this.fileContents && this.fileContents.trim().length !== 0
  }

  fetchData () {
    return this.parseFileContents()
      .then((records) => this.processRecords(records))
  }

  parseFileContents () {
    const extension = path.extname(this.filename)
    if (extension === '.csv') {
      return new Promise((resolve, reject) => {
        csvParse(this.fileContents, {columns: true}, (err, output) => {
          if (err) {
            return reject(err)
          } else {
            resolve(output)
          }
        })
      })
    } else if (extension === '.json') {
      return Promise.resolve(JSON.parse(this.fileContents))
    } else {
      throw new Error('Filetype not supported!')
    }
  }

  processRecords (records) {
    return records.map((record, i) => {
      const submission = new Submission({
        'source': 'file ' + this.filename + ' at ' + (new Date().toString()),
        'external_id': i,
        'created_at': new Date()
      })
      const data = {}
      for (var key in record) {
        data[key] = this.cleanString(record[key])
      }
      submission.set('data', data)
      return submission
    })
  }
}

module.exports = FileImporter
