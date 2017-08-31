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

const templateNames = ['account_reset','review_assigned'];
const templates = {};
let notificationLock = false;

exports.init = () => {
  return loadTemplates()
    .then(() => {
      setInterval(() => {
        handleNextNotification();
      },(parseInt(process.env.NOTIFICATION_INTERVAL) || 30000));
    });
}

const loadTemplates = () => {
  const loadNextTemplate = (index) => {
    if (index < templateNames.length) {
      const templateName = templateNames[index];
      return fs.readFile(path.join('.','emailTemplates',templateName+'.ejs'),'utf-8')
        .then((file) => {
          templates[templateName] = ejs.compile(file);
          return loadNextTemplate(index+1);
        });
    }
  }
  return loadNextTemplate(0);
}

const handleNextNotification = () => {
  if (!notificationLock) {
    notificationLock = true;
    Notification.nextNotification()
      .then((notification) => {
        if (notification) {
          return processNotification(notification)
            .then(() => {
              notification.set('queued',false);
              return notification.save();
            })
        }
      })
      .then(() => {
        notificationLock = false;
      })
      .catch((err) => {
        console.error(err);
      })
  }
}

const processNotification = (notification) => {
  return generateEmailDetails(notification)
    .then((emailDetails) => {
      const mailOptions = {
        'from': process.env.MAIL_FROM,
        'to': notification.user.email,
        'subject': mailOptions.subject,
        'text': mailOptions.body
      };
      return transporter.sendMail(mailOptions);
    });
}

const generateEmailDetails = (notification) => {
  switch (notification.type) {
    case 'account_reset':
      return new Promise((resolve,reject) => {
        resolve({
          'subject': 'Account Reset Instructions',
          'body': templates.account_reset({
            'url': (process.env.URL_ROOT || 'http://localhost:8000') + '/api/user/reset/' + notification.user.resetCode //TODO front end url
          })
        });
      })
    case 'review_assigned':
      return Review.byId(notification.data.review_id)
        .then((review) => {
          if (review) {
            return {
              'subject': 'Subission Assigned For Your Review',
              'body': templates.review_assigned({
                'url': (process.env.URL_ROOT || 'http://localhost:8000') //TODO front end url
              })
            };
          } else {
            throw new Error('Review ID invalid');
          }
        })
    default:
      return null;
  }
}
