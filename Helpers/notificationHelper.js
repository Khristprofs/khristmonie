// notificationHelper.js
const { Notification } = require('../models');

const getCurrencySymbol = (code) => {
  const symbols = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
  };
  return symbols[code] || code;
};

exports.createNotification = async ({
  userId,
  type = 'info',
  amount,
  currency = 'USD',
  transactionType = '',
  title,
  message,
  channel = 'in-app',
  priority = 'normal',
  referenceId,
  referenceType = 'Transaction'
}) => {
  const symbol = getCurrencySymbol(currency);

  const defaultTitle = title || `${transactionType.toUpperCase()} - ${symbol}${amount}`;
  const defaultMessage = message || `Your ${transactionType} of ${symbol}${amount} was successful.`;

  return await Notification.create({
    userId,
    type,
    title: defaultTitle,
    message: defaultMessage,
    channel,
    priority,
    referenceId,
    referenceType
  });
};