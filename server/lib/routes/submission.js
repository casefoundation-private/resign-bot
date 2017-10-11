const Submission = require('../models/submission');
const Favorite = require('../models/favorite');
const stringify = require('csv-stringify-as-promised');
const _ = require('lodash');
const allowedPublicSubmissionOrigins = process.env.ALLOWED_SUBMISSION_ORIGINS ? process.env.ALLOWED_SUBMISSION_ORIGINS.split(',') : [];

exports.getSubmissions = (req,res,next) => {
  Submission.all('created_at','desc')
    .then((values) => {
      res.json(values.filter((submission) => {
        return req.user.getSubmissionPermissions(submission).view;
      }).map((object) => {
        object.related('reviews');
        return object.toJSON();
      }));
    })
    .catch((err) => next(err));
}

const corsHeaders = (req,res) => {
  if (req.headers.origin) {
    const origin = req.headers.origin.replace('http://','').replace('https://','');
    if (allowedPublicSubmissionOrigins.indexOf(origin) >= 0) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
  }
}

exports.getPublicSubmissions = (req,res,next) => {
  Submission.published()
    .then((values) => {
      corsHeaders(req,res);
      res.json(values
        .map((object) => {
          const pojo = object.toJSON();
          delete pojo.created_at;
          delete pojo.deviation;
          delete pojo.external_id;
          delete pojo.flagged;
          delete pojo.flags;
          delete pojo.ip;
          delete pojo.score;
          delete pojo.source;
          delete pojo.updated_at;
          delete pojo.reviews;
          if (pojo.data.email) {
            delete pojo.data.email;
          }
          if (pojo.data.Email) {
            delete pojo.data.Email;
          }
          return pojo;
        })
      );
    })
    .catch((err) => next(err));
}

exports.getPublicSubmissionsOptions = (req,res,next) => {
  corsHeaders(req,res);
  res.sendStatus(200);
}

exports.getSubmission = (req,res,next) => {
  if (req.submission) {
    if (req.user.getSubmissionPermissions(req.submission).view) {
      res.json(req.submission.toJSON());
    } else {
      res.send(401);
    }
  } else {
    res.send(404);
  }
}

exports.getSubmissionReviews = (req,res,next) => {
  if (req.submission) {
    req.submission.fetch({
      'withRelated': ['reviews','reviews.user']
    }).then(() => {
      res.json(req.submission.related('reviews').filter((review) => {
        return req.user.getReviewPermissions(review).view;
      }).map((object) => {
        return object.toJSON();
      }));
    })
    .catch((err) => next(err));
  } else {
    res.send(404);
  }
}

exports.saveSubmission = (req,res,next) => {
  const save = (submission) => {
    submission.set('data',req.body.data);
    submission.set('flagged',req.body.flagged || false);
    submission.set('pinned',req.body.pinned || false);
    submission.set('autoFlagged',req.body.autoFlagged || false);
    submission.save()
      .then(() => {
        res.json(submission.toJSON());
      })
      .catch((err) => next(err) );
  }
  if (req.submission) {
    if (req.user.getSubmissionPermissions(req.submission).edit) {
      save(req.submission);
    } else {
      res.send(401);
    }
  } else {
    const submission = new Submission({
      'ip': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      'source': 'api'
    });
    save(submission);
  }
}

exports.saveFavorite = (req,res,next) => {
  const favorite = new Favorite({
    'user_id': req.user.id,
    'submission_id': req.submission.id
  });
  favorite.save()
    .then(() => {
      res.send(favorite.toJSON());
    })
    .catch((err) => next(err));
}

exports.deleteFavorite = (req,res,next) => {
  Favorite.bySubmissionAndUser(req.submission.id,req.user.id)
    .then((favorite) => {
      if (favorite) {
        return favorite.destroy();
      } else {
        throw new Error('Favorite does not exist.');
      }
    })
    .then(() => {
      res.send({
        'message': 'Deleted'
      });
    })
    .catch((err) => next(err));
}

exports.submissionsSpreadsheet = (req,res,next) => {
  Submission.all('created_at','desc')
    .then((values) => {
      return values.filter((submission) => {
        return req.user.getSubmissionPermissions(submission).view;
      }).map((object) => {
        return object.toJSON();
      });
    })
    .then((array) => {
      return array.map((baseObject) => {
        const returnObject = Object.assign({},baseObject.data || {});
        delete baseObject.data;
        delete baseObject.reviews;
        baseObject.created_at = new Date(Date.parse(baseObject.created_at)).toLocaleString();
        baseObject.updated_at = new Date(Date.parse(baseObject.updated_at)).toLocaleString();
        return Object.assign(returnObject,baseObject);
      });
    })
    .then((flattend) => {
      return new Promise((resolve,reject) => {
        req.user.fetch({'withRelated':'favorites'})
          .then(() => {
            console.log('here');
            flattend.forEach((submission) => {
              const favorite = req.user.related('favorites').find((_submission) => _submission.get('id') === submission.id);
              submission.favorite = !(!favorite);
            });
            resolve(flattend);
          })
          .catch((e) => reject(e));
      });
    })
    .then((flattend) => {
      const columns = [];
      flattend.forEach((row) => {
        _.keys(row).forEach((column) => {
          if (columns.indexOf(column) < 0) {
            columns.push(column);
          }
        });
      });
      return stringify(flattend,{
        'columns': columns,
        'header': true
      });
    })
    .then((csv) => {
      res.send({csv});
    })
    .catch((err) => next(err));
}
