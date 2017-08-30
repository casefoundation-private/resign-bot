const Review = require('../models/review');

exports.getReview = (req,res,next) => {
  if (req.review) {
    if (req.user.getReviewPermissions(req.review).view) {
      res.json(req.review.toJSON());
    } else {
      res.send(401);
    }
  } else {
    res.send(404);
  }
}

exports.saveReview = (req,res,next) => {
  const save = (review) => {
    review.set('score',req.body.score);
    review.set('data',req.body.data);
    review
      .save()
      .then(() => review.fetch({'withRelated':['user','submission']}))
      .then(() => {
        res.json(review.toJSON());
      })
      .catch((err) => next(err));
  }
  if (req.review) {
    if (req.user.getReviewPermissions(req.review).edit) {
      save(req.review);
    } else {
      res.send(401);
    }
  } else {
    const userId = req.user.isAdmin() ? req.body.user_id : req.user.get('id');
    const submissionId = req.body.submission_id;
    Review.reviewForUserAndSubmission(userId,submissionId)
      .then((review) => {
        if (!review) {
          review = new Review({
            'user_id': userId,
            'submission_id': submissionId
          });
          save(review);
        } else {
          res.status(400);
          next(new Error('Review already exists for that user and submission'));
        }
      })
      .catch((err) => next(err))
  }
}
