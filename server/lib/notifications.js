const Notification = require('./models/notification');
const User = require('./models/user');
const Review = require('./models/review');
const ejs = require('ejs');
const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  'host': process.env.MAIL_HOST,
  'port': parseInt(process.env.MAIL_PORT),
  'secure': JSON.parse(process.env.MAIL_SECURE || false),
  'auth': {
    'user': process.env.MAIL_USERNAME,
    'pass': process.env.MAIL_PASSWORD
  }
});

let notificationLock = false;

exports.init = () => {
  setInterval(() => {
    handleNextNotification();
  },(parseInt(process.env.NOTIFICATION_INTERVAL) || 30000));
  return handleNextNotification();
}

const handleNextNotification = () => {
  if (!notificationLock) {
    notificationLock = true;
    return Notification.aggregateReviewNotifications()
      .then(() => {
        return Notification.nextNotification();
      })
      .then((notification) => {
        if (notification) {
          return processNotification(notification).catch((err) => {
            console.error(err);
            notification.set('errored',true);
          })
          .then(() => {
            notificationLock = false;
            return notification.save();
          });
        } else {
          notificationLock = false;
        }
      })
      .catch((err) => {
        notificationLock = false;
        console.error(err);
      })
  }
}

const processNotification = (notification) => {
  console.log('Handling notification: ' + notification.get('type'))
  return generateEmailDetails(notification)
    .then((emailDetails) => {
      const mailOptions = {
        'from': process.env.MAIL_FROM,
        'to': notification.related('user').get('email'),
        'subject': emailDetails.subject,
        'html': emailDetails.body
      };
      return transporter.sendMail(mailOptions).then(() => {
        notification.set('queued',false);
      });
    });
}

const generateEmailDetails = (notification) => {
  switch (notification.get('type')) {
    case 'account_reset':
      return new Promise((resolve,reject) => {
        ejs.renderFile('./emailTemplates/account_reset.ejs',{
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '/#/reset/' + notification.related('user').get('resetCode')
        },(err,html) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              'subject': 'Account Reset Instructions',
              'body': html
            });
          }
        })
      });
    case 'account_welcome':
      return new Promise((resolve,reject) => {
        ejs.renderFile('./emailTemplates/account_welcome.ejs',{
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '/#/reset/' + notification.related('user').get('resetCode')
        },(err,html) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              'subject': 'Welcome to Review-O-Matic',
              'body': html
            });
          }
        })
      });
    case 'review_assigned':
      return Review.byId(notification.get('data').review_id)
        .then((review) => {
          if (review) {
            return new Promise((resolve,reject) => {
              ejs.renderFile('./emailTemplates/review_assigned.ejs',{
                'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/reviews/' + review.id
              },(err,html) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    'subject': 'Subission Assigned For Your Review',
                    'body': html
                  });
                }
              })
            });
          } else {
            throw new Error('Review ID invalid');
          }
        });
    case 'multiple_reviews_assigned':
      return new Promise((resolve,reject) => {
        ejs.renderFile('./emailTemplates/multiple_reviews_assigned.ejs',{
          'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/reviews'
        },(err,html) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              'subject': 'Multiple Subissions Assigned For Your Review',
              'body': html
            });
          }
        })
      });
      //TODO
    default:
      throw new Error('Notification type is invlaid');
  }
}
