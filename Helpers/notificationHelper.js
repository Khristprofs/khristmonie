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
  referenceType = 'Transaction',
  fromAccountNumber = '',
  toAccountNumber = ''
}) => {
  const symbol = getCurrencySymbol(currency);

  let defaultTitle = '';
  let defaultMessage = '';

  switch (transactionType) {
    case 'transfer':
      if (fromAccountNumber && toAccountNumber) {
        defaultTitle = title || `Transfer of ${symbol}${amount}`;
        defaultMessage =
          message ||
          `Transfer of ${symbol}${amount} from ${fromAccountNumber} to ${toAccountNumber} completed successfully.`;
      } else if (fromAccountNumber) {
        defaultTitle = title || `Sent ${symbol}${amount}`;
        defaultMessage =
          message ||
          `You sent ${symbol}${amount} from account ${fromAccountNumber}.`;
      } else if (toAccountNumber) {
        defaultTitle = title || `Received ${symbol}${amount}`;
        defaultMessage =
          message ||
          `You received ${symbol}${amount} to account ${toAccountNumber}.`;
      } else {
        defaultTitle = title || `Transfer - ${symbol}${amount}`;
        defaultMessage =
          message ||
          `Your transfer of ${symbol}${amount} was successful.`;
      }
      break;

    default:
      defaultTitle = title || `${transactionType.toUpperCase()} - ${symbol}${amount}`;
      defaultMessage =
        message || `Your ${transactionType} of ${symbol}${amount} was successful.`;
      break;
  }

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
