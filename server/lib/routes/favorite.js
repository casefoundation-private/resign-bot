const Favorite = require('../models/favorite');

exports.getFavorites = (req,res,next) => {
  req.user.fetch({'withRelated':'favorites'})
    .then(() => {
      res.send(req.user.related('favorites').map((favorite) => favorite.toJSON()));
    })
    .catch((err) => next(err));
}
