const Submission = require('../models/submission');

//TODO auth
exports.getSubmissions = (req,res,next) => {
  const respond = (values) => {
    res.json(values.toJSON());
  }
  if (typeof req.query.reviewed === 'undefined') {
    Submission.all().then(respond).catch((err) => next(err));
  } else {
    if (req.query.reviewed) {
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
}
