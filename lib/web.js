const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const http = require('http');
const User = require('./models/user');
const Review = require('./models/review');
const Submission = require('./models/submission');
const routes = require('./routes');

exports.init = (serve) => {
  const app = express();
  app.use(bodyParser.json({
    'extended': true
  }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.static(path.join(__dirname, 'build')));
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

  // app.get('/api/auth/login',null); //TODO
  // app.get('/api/auth/reset',null); //TODO

  app.get('/api/user/:user',routes.user.getUser);
  app.post('/api/user/:user',routes.user.saveUser);

  app.get('/api/submission',routes.submission.getSubmissions);
  app.get('/api/submission/:submission',routes.submission.getSubmission);
  app.put('/api/submission',routes.submission.saveSubmission);
  app.post('/api/submission/:submission',routes.submission.saveSubmission);

  app.get('/api/review/:review',routes.review.getReview);
  app.put('/api/review',routes.review.saveReview);
  app.post('/api/review/:review',routes.review.saveReview);

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
