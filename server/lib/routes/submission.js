const Submission = require('../models/submission');
const Favorite = require('../models/favorite');
const stringify = require('csv-stringify-as-promised');
const _ = require('lodash');

exports.getSubmissions = (req,res,next) => {
  Submission.all()
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
  Submission.all()
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
