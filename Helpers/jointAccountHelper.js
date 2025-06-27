const { UserAccount } = require('../models');

exports.checkDuplicateJointAccount = async (userId, accountId) => {
  const exists = await UserAccount.findOne({ where: { userId, accountId } });
  return !!exists;
};