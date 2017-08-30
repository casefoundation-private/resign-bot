const Review = require('../models/review');

//TODO auth
exports.getReview = (req,res,next) => {
  if (req.review) {
    res.json(req.review.toJSON());
  } else {
    res.send(404);
  }
}

//TODO auth
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
    save(req.review);
  } else {
    const userId = req.body.user_id; //TODO role check
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
          res.status(400).send({
            'message': 'Review already exists for that user and submission'
          });
        }
      })
      .catch((err) => next(err))
  }
}
