const Notification = require('../models/notification');

exports.getNotifications = (req,res,next) => {
  Notification.queue()
    .then((notifications) => {
      res.send(notifications.filter((notification) => {
        return req.user.getNotificationPermissions(notification).view;
      }).map((notification) => {
        return notification.toJSON();
      }));
    })
    .catch((err) => next(err));
}
