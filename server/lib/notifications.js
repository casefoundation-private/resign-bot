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
      return handleNextNotification();
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
    return Notification.nextNotification()
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
        resolve({
          'subject': 'Account Reset Instructions',
          'body': templates.account_reset({
            'url': (process.env.URL_ROOT || 'http://localhost:3000') + '/#/reset/' + notification.related('user').get('resetCode')
          })
        });
      })
    case 'review_assigned':
      return Review.byId(notification.get('data').review_id)
        .then((review) => {
          if (review) {
            return {
              'subject': 'Subission Assigned For Your Review',
              'body': templates.review_assigned({
                'url': (process.env.URL_ROOT || 'http://localhost:3000') + '#/reviews/' + review.id
              })
            };
          } else {
            throw new Error('Review ID invalid');
          }
        })
    default:
      throw new Error('Notification type is invlaid');
  }
}
