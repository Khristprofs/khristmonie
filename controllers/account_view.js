const Account = require('../models/Account');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Branch = require('../models/Branch');
const UserAccount = require('../models/UserAccount')

// Helper to generate a unique 10-digit account number
const generateAccountNumber = async () => {
    let unique = false;
    let accountNumber;

    while (!unique) {
        accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const existing = await Account.findOne({ where: { accountNumber } });
        if (!existing) unique = true;
    }

    return accountNumber;
};

exports.createAccount = async (req, res) => {
    try {
        const {
            userId,
            branchId,
            accountName,
            accountType,
            transferPin,
            currency,
            balance,
            status,
            isJoint
        } = req.body;

        if (!userId || !branchId || !accountName || !accountType || !transferPin || !currency) {
            return res.status(400).json({
                message: 'User ID, branch ID, account name, account type, transfer pin, and currency are required'
            });
        }

        // Validate user and branch
        const existingUser = await User.findByPk(userId);
        if (!existingUser) return res.status(404).json({ message: 'User not found' });

        const existingBranch = await Branch.findByPk(branchId);
        if (!existingBranch) return res.status(404).json({ message: 'Branch not found' });

        // Validate account type and currency
        const validAccountTypes = ['savings', 'current', 'fixed', 'joint'];
        if (!validAccountTypes.includes(accountType)) {
            return res.status(400).json({ message: 'Invalid account type specified' });
        }

        if (!/^\d{4}$/.test(transferPin)) {
            return res.status(400).json({ message: 'Transfer pin must be a 4-digit number' });
        }

        if (!/^[A-Z]{3}$/.test(currency)) {
            return res.status(400).json({ message: 'Currency must be a 3-letter uppercase code' });
        }

        // ✅ Generate unique account number
        const accountNumber = await generateAccountNumber();

        // ✅ Hash transfer pin
        const hashTransferPin = await bcrypt.hash(transferPin, 10);

        // ✅ Create new account
        const newAccount = await Account.create({
            userId,
            branchId,
            accountName,
            accountType,
            accountNumber,
            transferPin: hashTransferPin,
            balance: balance || 0,
            currency,
            status: status || 'active',
            isJoint: isJoint || false
        });

        // ✅ If joint account, add record to user_accounts
        if (isJoint) {
            await UserAccount.create({
                userId,
                accountId: newAccount.id,
                isPrimary: true,
                role: 'owner'
            });
        }

        res.status(201).json({
            message: 'Account created successfully',
            account: newAccount
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({
            message: 'Failed to create account',
            error: error.message
        });
    }
};

exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
};

exports.getAllAccountsByBank = async (req, res) => {
    try {
        const { bankId } = req.params;

        const accounts = await Account.findAll({
            include: [
                {
                    model: Branch,
                    as: 'branch',
                    where: { bankId }
                }
            ],
            order: [['created', 'DESC']]
        });

        if (!accounts.length) {
            return res.status(404).json({ message: 'No accounts found for this bank' });
        }

        res.status(200).json(accounts);
    } catch (error) {
        console.error('Error fetching accounts by bank:', error);
        res.status(500).json({ message: 'Failed to fetch accounts for bank', error: error.message });
    }
};

exports.getAccountById = async (req, res) => {
    const { id } = req.params;
    const user = req.user; // info from JWT middleware

    try {
        const account = await Account.findByPk(id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        const allowedRoles = ['admin', 'bank_admin', 'customer_service', 'staff'];

        if (account.userId !== user.id && !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Unauthorized access to this account' });
        }

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch account',
            error: error.message
        });
    }
};



exports.getAccountsByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const accounts = await Account.findAll({ where: { userId } });
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found for this user' });
        }
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
};

exports.getAccountsByBranchId = async (req, res) => {
    const { branchId } = req.params;
    try {
        const accounts = await Account.findAll({ where: { branchId } });
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found for this branch' });
        }
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
};

exports.getAccountsByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const accounts = await Account.findAll({ where: { status } });
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found with this status' });
        }
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
};

exports.getAccountsByCurrency = async (req, res) => {
    const { currency } = req.params;
    try {
        const accounts = await Account.findAll({ where: { currency } });
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found with this currency' });
        }
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
};

exports.getAccountsByAccountType = async (req, res) => {
    const { accountType } = req.params;
    try {
        const accounts = await Account.findAll({ where: { accountType } });
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found with this account type' });
        }
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
};

exports.updateAccount = async (req, res) => {
    const { id } = req.params;
    const { accountName, accountType, transferPin, balance, status, currency, isJoint } = req.body;

    try {
        const account = await Account.findByPk(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Validate account type
        const validAccountTypes = ['savings', 'current', 'fixed', 'joint'];
        if (accountType && !validAccountTypes.includes(accountType)) {
            return res.status(400).json({ message: 'Invalid account type specified' });
        }

        // Validate transfer pin
        if (transferPin && !/^\d{4,6}$/.test(transferPin)) {
            return res.status(400).json({ message: 'Transfer pin must be a 4 to 6 digit number' });
        }
        const hashedTransferPin = await bcrypt.hash(transferPin, 10)

        // Update the account
        await account.update({
            accountName,
            accountType,
            transferPin: hashedTransferPin,
            balance,
            currency,
            status,
            isJoint: isJoint || false
        });

        res.status(200).json({ message: 'Account updated successfully', account });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update account', error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const account = await Account.findByPk(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        await account.destroy();
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
};
