const Notification = require('./models/notification')
const ejs = require('ejs')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  'host': process.env.MAIL_HOST,
  'port': parseInt(process.env.MAIL_PORT),
  'secure': JSON.parse(process.env.MAIL_SECURE || false),
  'auth': {
    'user': process.env.MAIL_USERNAME,
    'pass': process.env.MAIL_PASSWORD
  }
})

let notificationLock = false

exports.init = () => {
  setInterval(() => {
    handleNextNotification()
  }, (parseInt(process.env.NOTIFICATION_INTERVAL) || 30000))
  return handleNextNotification()
}

const handleNextNotification = () => {
  if (!notificationLock) {
    notificationLock = true
    return Notification.aggregateReviewNotifications()
      .then(() => {
        return Notification.nextNotification()
      })
      .then((notification) => {
        if (notification) {
          return processNotification(notification).catch((err) => {
            console.error(err)
            notification.set('errored', true)
          })
            .then(() => {
              notificationLock = false
              return notification.save()
            })
        } else {
          notificationLock = false
        }
      })
      .catch((err) => {
        notificationLock = false
        console.error(err)
      })
  }
}

const processNotification = (notification) => {
  console.log('Handling notification: ' + notification.get('type'))
  if (notification.related('user').get('notificationPreferences')[notification.get('type')] !== false) {
    return generateEmailDetails(notification)
      .then((emailDetails) => {
        const mailOptions = {
          'from': process.env.MAIL_FROM,
          'to': notification.related('user').get('email'),
          'subject': emailDetails.subject,
          'html': emailDetails.body
        }
        return transporter.sendMail(mailOptions).then(() => {
          notification.set('queued', false)
        })
      })
  } else {
    console.log('User notification muted for that type.')
    notification.set('queued', false)
    return new Promise((resolve) => resolve())
  }
}

const generateEmailDetails = (notification) => {
  switch (notification.get('type')) {
    case 'account_reset':
      return new Promise((resolve, reject) => {
        ejs.renderFile('./emailTemplates/account_reset.ejs', {
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '/#/reset/' + notification.related('user').get('resetCode')
        }, (err, html) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              'subject': 'Account Reset Instructions',
              'body': html
            })
          }
        })
      })
    case 'account_welcome':
      return new Promise((resolve, reject) => {
        ejs.renderFile('./emailTemplates/account_welcome.ejs', {
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '/#/reset/' + notification.related('user').get('resetCode')
        }, (err, html) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              'subject': 'Welcome to Review-O-Matic',
              'body': html
            })
          }
        })
      })
    case 'review_assigned':
      return new Promise((resolve, reject) => {
        ejs.renderFile('./emailTemplates/review_assigned.ejs', {
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/reviews/' + notification.get('data').review_id
        }, (err, html) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              'subject': 'Submission Assigned For Your Review',
              'body': html
            })
          }
        })
      })
    case 'multiple_reviews_assigned':
      return new Promise((resolve, reject) => {
        ejs.renderFile('./emailTemplates/multiple_reviews_assigned.ejs', {
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/reviews'
        }, (err, html) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              'subject': 'Multiple Submission Assigned For Your Review',
              'body': html
            })
          }
        })
      })
    case 'submission_created':
      return new Promise((resolve, reject) => {
        ejs.renderFile('./emailTemplates/submissions_created.ejs', {
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/submissions/' + notification.get('data').submission_id
        }, (err, html) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              'subject': 'Submission Created',
              'body': html
            })
          }
        })
      })
    case 'multiple_submissions_created':
      return new Promise((resolve, reject) => {
        ejs.renderFile('./emailTemplates/multiple_submissions_created.ejs', {
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/submissions'
        }, (err, html) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              'subject': 'Submissions Created',
              'body': html
            })
          }
        })
      })
    default:
      throw new Error('Notification type is invlaid')
  }
}
