const Review = require('../models/review');
const User = require('../models/user');

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

exports.deleteReview = (req,res,next) => {
  if (req.review) {
    if (req.user.getReviewPermissions(req.review).delete) {
      req.review.destroy()
        .then(() => {
          res.json({'message':'Review deleted'})
        });
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
    review.set('data',req.body.data || {});
    review.set('flagged',req.body.flagged || false); //TODO test
    if (req.user.isAdmin()) {
      if (req.body.user_id) {
        review.set('user_id',req.body.user_id);
      }
    }
    review
      .save()
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
    const finishReviewCreation = (_userId) => {
      Review.reviewForUserAndSubmission(_userId,submissionId)
        .then((review) => {
          if (!review) {
            review = new Review({
              'user_id': _userId,
              'submission_id': submissionId,
              'flagged': false
            });
            save(review);
          } else {
            res.status(400);
            throw new Error('Review already exists for that user and submission.');
          }
        })
        .catch((err) => next(err));
    }
    if (userId) {
      finishReviewCreation(_userId);
    } else {
      Review.forSubmission(submissionId)
        .then((reviews) => {
          const userIds = reviews.map((review) => {
            return review.get('user_id');
          });
          User.nextAvailableUsers(1,userIds,[submissionId]).then((users) => {
            if (users && users.length > 0) {
              finishReviewCreation(users.at(0).get('id'));
            } else {
              throw new Error('There are no users available to review this submission.')
            }
          })
        }).catch((err) => next(err));
    }
  }
}

exports.recuseReview = (req,res,next) => {
  if (req.user.getReviewPermissions(req.review).edit) {
    req.review.recuse()
      .then(() => {
        return req.review.save();
      })
      .then(() => {
        res.send({
          'message': 'OK'
        });
      })
      .catch((err) => next(err));
  } else {
    res.send(401);
  }
}
