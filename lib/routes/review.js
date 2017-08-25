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
    review.set('score',req.score);
    review.set('data',req.data);
    review
      .save()
      .then(() => {
        res.json(review.toJSON());
      })
      .catch((err) => next(err));
  }
  if (req.review) {
    save(req.review);
  } else {
    Review.reviewForUserAndSubmission(req.user,req.body.submission)
      .then((review) => {
        if (!review) {
          review = new Review({
            'user': req.user.id,
            'submission': req.body.submission
          });
        }
        save(review);
      })
      .catch((err) => next(err))
  }
}
