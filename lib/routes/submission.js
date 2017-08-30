const Submission = require('../models/submission');

//TODO auth
exports.getSubmissions = (req,res,next) => {
  const respond = (values) => {
    res.json(values.toJSON());
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

//TODO auth
exports.getSubmission = (req,res,next) => {
  if (req.submission) {
    res.json(req.submission.toJSON());
  } else {
    res.send(404);
  }
}

exports.getSubmissionReviews = (req,res,next) => {
  if (req.submission) {
    res.json(req.submission.related('reviews').toJSON());
  } else {
    res.send(404);
  }
}

//TODO auth
exports.saveSubmission = (req,res,next) => {
  let submission;
  if (req.submission) {
    submission = req.submission;
  } else {
    submission = new Submission({
      'ip': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      'source': 'api'
    });
  }
  submission.set('data',req.body.data);
  submission.save()
    .then(() => {
      res.json(submission.toJSON());
    })
    .catch((err) => next(err));
}
