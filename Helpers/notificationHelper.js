const { Notification } = require('../models');

exports.createNotification = async ({
  userId,
  type = 'info',
  title,
  message,
  channel = 'in-app',
  priority = 'normal',
  referenceId,
  referenceType = 'Transaction'
}) => {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    channel,
    priority,
    referenceId,
    referenceType
  });
};