const Submission = require('../models/submission');

//TODO scrub users

exports.getSubmissions = (req,res,next) => {
  const respond = (values) => {
    res.json(values.filter((submission) => {
      return req.user.getSubmissionPermissions(submission).view;
    }).map((object) => {
      object.related('reviews'); //TODO test
      return object.toJSON();
    }));
  }
  if (typeof req.query.reviewed === 'undefined') {
    Submission.all().then(respond).catch((err) => next(err));
  } else {
    if (JSON.parse(req.query.reviewed) == true) {
      Submission.reviewed().then(respond).catch((err) => next(err));
    } else {
      Submission.unreviewed().then(respond).catch((err) => next(err));
    }
  }
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
    res.json(req.submission.related('reviews').filter((review) => {
      return req.user.getReviewPermissions(review).view;
    }).map((object) => {
      return object.toJSON();
    }));
  } else {
    res.send(404);
  }
}

exports.saveSubmission = (req,res,next) => {
  const save = (submission) => {
    submission.set('data',req.body.data);
    submission.save()
      .then(() => {
        res.json(submission.toJSON());
      })
      .catch((err) => next(err));
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
