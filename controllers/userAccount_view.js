const { User, Account, UserAccount, Branch } = require('../models');
const { checkDuplicateJointAccount } = require('../Helpers/jointAccountHelper');

exports.create = async (req, res) => {
  try {
    const { userId, accountId, role, relationship } = req.body;

    // Check if User and Account exist
    const user = await User.findByPk(userId);
    const account = await Account.findByPk(accountId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Check for duplicate
    const duplicate = await checkDuplicateJointAccount(userId, accountId);
    if (duplicate) {
      return res.status(409).json({ message: 'User is already linked to this account.' });
    }

    // Create joint account record
    const userAccount = await UserAccount.create({
      userId,
      accountId,
      role,
      relationship,
    });

    return res.status(201).json({
      message: 'Joint account created successfully',
      data: userAccount
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create joint account',
      error: error.message,
    });
  }
};

exports.getAllJointAccounts = async (req, res) => {
  try {
    const jointAccounts = await UserAccount.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Account, as: 'account' }
      ]
    });

    return res.status(200).json({
      message: 'Joint accounts fetched successfully',
      data: jointAccounts
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch joint accounts',
      error: error.message,
    });
  }
};

exports.getAllJointAccountsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    const jointAccounts = await Account.findAll({
      where: { isJoint: true },
      include: [
        {
          model: Branch,
          as: 'branch',
          where: { bankId }
        }
      ],
      order: [['created', 'DESC']]
    });

    if (!jointAccounts.length) {
      return res.status(404).json({ message: 'No joint accounts found for this bank' });
    }

    res.status(200).json(jointAccounts);
  } catch (error) {
    console.error('Error fetching joint accounts by bank:', error);
    res.status(500).json({ message: 'Failed to get joint accounts for bank', error: error.message });
  }
};

exports.getAllJointAccountsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const jointAccounts = await Account.findAll({
      where: {
        isJoint: true,
        branchId
      },
      order: [['created', 'DESC']]
    });

    if (!jointAccounts.length) {
      return res.status(404).json({ message: 'No joint accounts found for this branch' });
    }

    res.status(200).json(jointAccounts);
  } catch (error) {
    console.error('Error fetching joint accounts by branch:', error);
    res.status(500).json({ message: 'Failed to get joint accounts for branch', error: error.message });
  }
};

exports.getJointAccountById = async (req, res) => {
  const { id } = req.params;

  try {
    const jointAccount = await UserAccount.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Account, as: 'account' }
      ]
    });

    if (!jointAccount) return res.status(404).json({ message: 'Joint account not found' });

    return res.status(200).json({
      message: 'Joint account fetched successfully',
      data: jointAccount
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch joint account',
      error: error.message,
    });
  }
};

exports.updateJointAccount = async (req, res) => {
  const { id } = req.params;
  const { role, relationship, addedBy } = req.body;

  try {
    const jointAccount = await UserAccount.findByPk(id);
    if (!jointAccount) return res.status(404).json({ message: 'Joint account not found' });

    jointAccount.role = role || jointAccount.role;
    jointAccount.relationship = relationship || jointAccount.relationship;
    jointAccount.addedBy = addedBy || jointAccount.addedBy;

    const updatedJointAccount = await jointAccount.save();

    return res.status(200).json({
      message: 'Joint account updated successfully',
      data: updatedJointAccount
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update joint account',
      error: error.message,
    });
  }
};

exports.deleteJointAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const jointAccount = await UserAccount.findByPk(id);
    if (!jointAccount) return res.status(404).json({ message: 'Joint account not found' });

    await jointAccount.destroy();

    return res.status(200).json({
      message: 'Joint account deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete joint account',
      error: error.message,
    });
  }
};