const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const http = require('http');
const User = require('./models/user');
const Review = require('./models/review');
const Submission = require('./models/submission');
const routes = require('./routes');
const passport = require('passport');
const auth = require('./auth');

exports.init = (serve) => {
  const app = express();
  app.use(bodyParser.json({
    'extended': true
  }));
  app.use(bodyParser.urlencoded({
    'extended': true
  }));
  auth.init(app);
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.static('./build'));
    app.use(logger('combined'));
  }

  [
    [Submission,'submission'],
    [Review,'review']
  ].forEach((props) => {
    app.param(props[1],(req,res,next,id) => {
      props[0].byId(id)
        .then((object) => {
          if (object) {
            req[props[1]] = object;
          } else {
            req[props[1]] = null;
          }
          next();
        })
        .catch((err) => {
          console.log(err)
          next(err);
        })
    });
  });

  app.param('user',(req,res,next,id) => {
    User.byId(id)
      .then((object) => {
        if (object) {
          req._user = object;
        } else {
          req._user = null;
        }
        next();
      })
      .catch((err) => {
        next(err);
      })
  });

  const authenticate = passport.authenticate('jwt', { 'session': false });

  app.post('/api/user/login',routes.user.login);
  app.post('/api/user/reset',routes.user.startReset);
  app.get('/api/user/reset/:code',routes.user.completeReset);
  app.get('/api/user',authenticate,routes.user.getUsers);
  app.get('/api/user/:user',authenticate,routes.user.getUser);
  app.get('/api/user/:user/reviews',authenticate,routes.user.getUserReviews);
  app.post('/api/user/:user/reviews/reassign',authenticate,routes.user.reassignUserReviews);
  app.get('/api/user/:user/favorites',authenticate,routes.user.getFavorites);
  app.put('/api/user',authenticate,routes.user.saveUser);
  app.post('/api/user/:user',authenticate,routes.user.saveUser);

  app.get('/api/submission',authenticate,routes.submission.getSubmissions);
  app.get('/api/submission/public',routes.submission.getPublicSubmissions); //TODO test
  app.get('/api/submission/export',authenticate,routes.submission.submissionsSpreadsheet); //TODO test
  app.get('/api/submission/:submission',authenticate,routes.submission.getSubmission);
  app.get('/api/submission/:submission/reviews',authenticate,routes.submission.getSubmissionReviews);
  app.put('/api/submission',authenticate,routes.submission.saveSubmission);
  app.post('/api/submission/:submission',authenticate,routes.submission.saveSubmission);
  app.put('/api/submission/:submission/favorite',authenticate,routes.submission.saveFavorite);
  app.delete('/api/submission/:submission/favorite',authenticate,routes.submission.deleteFavorite);

  app.get('/api/review/:review',authenticate,routes.review.getReview);
  app.put('/api/review',authenticate,routes.review.saveReview);
  app.post('/api/review/:review',authenticate,routes.review.saveReview);
  app.post('/api/review/:review/recuse',authenticate,routes.review.recuseReview); //TODO test

  app.get('/api/notification',authenticate,routes.notification.getNotifications); //TODO test

  app.get('/api/config',authenticate,routes.config.getConfig);

  app.post('/api/webbooks/wufoo',routes.webhooks.wufoo);

  app.use((err,req,res,next) => {
    if (err) {
      const status = res.statusCode || 500;
      res.status(status).json({
        'error': err.message || err
      });
    } else {
      next();
    }
  });

  if (serve) {
    return new Promise((resolve,reject) => {
      app.listen(process.env.PORT || 8000,(err) => {
        if (err) {
          reject(err);
        } else {
          resolve(app);
        }
      })
    })
  } else {
    return app;
  }
}
