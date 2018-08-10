const knex = require('../database').knex
const bookshelf = require('bookshelf')(knex)
const jsonColumns = require('bookshelf-json-columns')
const Notification = require('./notification')
const Configuration = require('./configuration')
const _ = require('lodash')
const BadLanguageFilter = require('bad-language-filter')
const blFilter = new BadLanguageFilter()
bookshelf.plugin(jsonColumns)
bookshelf.plugin('virtuals')

const Submission = module.exports = bookshelf.Model.extend({
  'tableName': 'submissions',
  'hasTimestamps': true,
  'reviews': function () {
    const Review = require('./review')
    return this.hasMany(Review)
  },
  'initialize': function () {
    this.on('created', function () {
      const User = require('./user')
      const Review = require('./review')
      return Notification.submissionCreated(this)
        .then((notifications) => {
          return Promise.all(
            notifications.map((notification) => notification.save())
          )
        })
        .then(() => {
          return User.nextAvailableUsers(Configuration.getConfig('reviewsPerSubmission') || 1, [])
        })
        .then((users) => {
          if (users && users.length > 0) {
            return Promise.all(
              users.map((user) => {
                return new Review({
                  'user_id': user.get('id'),
                  'submission_id': this.get('id')
                }).save()
              })
            )
          } else {
            throw new Error('No users ready!')
          }
        })
    }, this)
    this.on('updating', function () {
      if (Configuration.getConfig('pinnedLimit') && this.get('pinned') && this.get('pinned') !== this.previous('pinned')) {
        return Submission.checkForPinLimit().then((limitReached) => {
          if (limitReached) {
            throw new Error('Too many submissions pinned.')
          }
        })
      }
    }, this)
    this.on('creating', function () {
      let badLanguage = false
      for (var key in this.get('data')) {
        if (blFilter.contains(' ' + this.get('data')[key] + ' ')) {
          badLanguage = true
        }
      }
      this.set('autoFlagged', badLanguage)
      if (Configuration.getConfig('pinnedLimit') && this.get('pinned')) {
        return Submission.checkForPinLimit().then((limitReached) => {
          if (limitReached) {
            throw new Error('Too many submissions pinned.')
          }
        })
      }
    }, this)
    bookshelf.Model.prototype.initialize.apply(this, arguments)
  },
  'toJSON': function (options) {
    const sendOpts = options ? Object.assign(options, {'virtuals': true}) : {'virtuals': true}
    const json = bookshelf.Model.prototype.toJSON.apply(this, sendOpts)
    json.flagged = json.flagged === true || json.flagged === 1
    json.autoFlagged = json.autoFlagged === true || json.autoFlagged === 1
    json.pinned = json.pinned === true || json.pinned === 1
    json.embargoed = json.embargoed === true || json.embargoed === 1
    return json
  },
  'virtuals': {
    'isFlagged': function () {
      return this.get('flags') > 0 || this.get('autoFlagged') || this.get('flagged')
    },
    'flags': function () {
      const reviews = this.related('reviews')
      if (reviews && reviews.length > 0) {
        return reviews.reduce((total, review) => {
          return total + (review.get('flagged') ? 1 : 0)
        }, 0)
      }
      return null
    },
    'score': function () {
      const reviews = this.related('reviews')
      if (reviews && reviews.length > 0) {
        const completedReviews = reviews.filter((review) => review.get('score') !== null)
        if (completedReviews && completedReviews.length > 0) {
          return completedReviews.reduce((last, current) => {
            return last + current.get('score')
          }, 0) / completedReviews.length
        }
      }
      return null
    },
    'deviation': function () {
      const reviews = this.related('reviews')
      if (reviews && reviews.length > 0) {
        const completedReviews = reviews.filter((review) => review.get('score') !== null)
        if (completedReviews && completedReviews.length > 0) {
          const avg = completedReviews.reduce((last, review) => {
            return last + review.get('score')
          }, 0) / completedReviews.length

          const squareDiffs = completedReviews.map((review) => {
            const diff = review.get('score') - avg
            const sqr = diff * diff
            return sqr
          })

          const avgSquareDiff = squareDiffs.reduce((last, current) => {
            return last + current
          }, 0) / squareDiffs.length

          return Math.sqrt(avgSquareDiff)
        }
      }
      return null
    },
    'categories': function () {
      const reviews = this.related('reviews')
      if (reviews && reviews.length > 0) {
        const categoryVoteMap = {}
        reviews.filter((review) => review.get('score') !== null).forEach((review) => {
          if (review.get('data') && review.get('data').categories) {
            review.get('data').categories.forEach((category, i) => {
              const categoryName = Configuration.getConfig('review').categories[i].prompt
              if (!categoryVoteMap[categoryName]) {
                categoryVoteMap[categoryName] = {}
              }
              if (!categoryVoteMap[categoryName][category]) {
                categoryVoteMap[categoryName][category] = 1
              } else {
                categoryVoteMap[categoryName][category]++
              }
            })
          }
        })
        const categories = {}
        _.keys(categoryVoteMap).forEach((categoryName) => {
          let winnerCategory = null
          let winnerVote = -1
          _.keys(categoryVoteMap[categoryName]).forEach((category) => {
            const vote = categoryVoteMap[categoryName][category]
            if (vote > winnerVote) {
              winnerCategory = category
            }
          })
          categories[categoryName] = winnerCategory
        })
        return categories
      }
      return null
    }
  }
}, {
  'jsonColumns': ['data'],
  'all': function (sortColumn, sortDirection) {
    return this
      .forge()
      .orderBy(sortColumn, sortDirection)
      .fetchAll({
        'withRelated': 'reviews'
      })
  },
  'byId': function (id) {
    return this.forge().query((qb) => {
      qb.where('id', id)
    }).fetch({
      'withRelated': 'reviews'
    })
  },
  'bySourceAndExternalId': function (source, externalId) {
    return this
      .forge()
      .query({
        'where': {
          'source': source,
          'external_id': externalId
        }
      })
      .fetch()
  },
  'published': function () {
    return this
      .forge()
      .query((qb) => {
        qb.where({'flagged': false})
        qb.where({'autoFlagged': false})
        qb.where({'embargoed': false})
        const subquery = knex
          .select(['submission_id'])
          .from('reviews')
          .where({'flagged': true})
          .whereNotNull('score')
        qb.whereNotIn('id', subquery)
      })
      .orderBy('pinned', 'DESC')
      .orderBy('created_at', 'DESC')
      .fetchAll({
        'withRelated': ['reviews']
      })
  },
  'checkForPinLimit': function () {
    return knex('submissions')
      .count('*')
      .where({'pinned': true})
      .then((total) => {
        if (total[0]['count(*)'] >= Configuration.getConfig('pinnedLimit') || total[0]['count'] >= Configuration.getConfig('pinnedLimit')) {
          return true
        } else {
          return false
        }
      })
  },
  'embargoed': function () {
    return this
      .forge()
      .query((qb) => {
        qb.where({'embargoed': true})
      })
      .fetchAll()
  }
})
