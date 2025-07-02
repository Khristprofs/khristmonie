const { Loan, User, Account } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../Helpers/notificationHelper');
const { sequelize } = require('../models');


exports.createLoan = async (req, res) => {
    try {
        const { userId, amount, loanType, interestRate, termMonths, collateral, notes } = req.body;

        if (!userId || !amount || !loanType || !interestRate || !termMonths) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        const monthlyInterest = interestRate / 100 / 12;
        const monthlyPayment = (amount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -termMonths));

        const loan = await Loan.create({
            userId,
            amount,
            loanType,
            interestRate,
            termMonths,
            monthlyPayment,
            balance: amount,
            collateral,
            notes
        });

        res.status(201).json({ message: 'Loan created successfully', loan });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create loan', error: error.message });
    }
};

exports.getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({ include: ['user'] });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
    }
};

exports.getLoansByBank = async (req, res) => {
    try {
        const { bankId } = req.params;

        const loans = await Loan.findAll({
            include: {
                model: User,
                as: 'user',
                include: {
                    model: Account,
                    as: 'accounts',
                    where: { bankId },
                    attributes: ['id', 'accountNumber', 'bankId']
                }
            },
            order: [['created', 'DESC']]
        });

        if (!loans.length) {
            return res.status(404).json({ message: 'No loans found for this bank' });
        }

        res.status(200).json(loans);
    } catch (error) {
        console.error('Error fetching loans by bank:', error);
        res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
    }
};

exports.getLoansByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        const loans = await Loan.findAll({
            include: {
                model: User,
                as: 'user',
                include: {
                    model: Account,
                    as: 'accounts',
                    where: { branchId },
                    attributes: ['id', 'accountNumber', 'branchId']
                }
            },
            order: [['created', 'DESC']]
        });

        if (!loans.length) {
            return res.status(404).json({ message: 'No loans found for this branch' });
        }

        res.status(200).json(loans);
    } catch (error) {
        console.error('Error fetching loans by branch:', error);
        res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
    }
};


exports.getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.loanId, { include: ['user'] });
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        res.status(200).json(loan);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch loan', error: error.message });
    }
};

exports.getLoansByUserId = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId, {
            include: ['loans']
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.loans || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user loans', error: error.message });
    }
};

exports.getRejectedLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({ where: { status: 'rejected' } });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rejected loans', error: error.message });
    }
};

exports.getApprovedLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({ where: { status: 'approved' } });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch approved loans', error: error.message });
    }
};

exports.getDisbursedLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({ where: { status: 'disbursed' } });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch disbursed loans', error: error.message });
    }
};

exports.updateLoan = async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        await loan.update(req.body);
        res.status(200).json({ message: 'Loan updated', loan });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update loan', error: error.message });
    }
};

exports.deleteLoan = async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        await loan.destroy();
        res.status(200).json({ message: 'Loan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete loan', error: error.message });
    }
};

exports.approveOrRejectLoan = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || !req.body.status) {
            return res.status(400).json({ message: 'Status is required in the request body' });
        }

        const { status } = req.body;

        // Validate status value
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be either "approved" or "rejected"' });
        }

        const loan = await Loan.findByPk(req.params.loanId);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // Update loan
        const updateData = { status };
        if (status === 'approved') {
            updateData.approvedAt = new Date();
            updateData.rejectedAt = null; // Clear rejectedAt if approving
        } else if (status === 'rejected') {
            updateData.rejectedAt = new Date();
            updateData.approvedAt = null; // Clear approvedAt if rejecting
        }

        await loan.update(updateData);
        res.status(200).json({ message: `Loan ${status}`, loan });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update loan status', error: error.message });
    }
};

exports.disburseLoan = async (req, res) => {
    const { loanId } = req.params;

    const t = await sequelize.transaction();
    try {
        const loan = await Loan.findByPk(loanId, { transaction: t });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.status !== 'approved') {
            return res.status(400).json({ message: 'Loan must be approved before disbursement' });
        }

        const account = await Account.findOne({ where: { userId: loan.userId }, transaction: t });

        if (!account) {
            return res.status(404).json({ message: 'User account not found for disbursement' });
        }

        // 💰 Update account balance
        account.balance = parseFloat(account.balance) + parseFloat(loan.amount);
        await account.save({ transaction: t });

        // 🧾 Update loan status and disbursed date
        loan.status = 'disbursed';
        loan.disbursedAt = new Date();
        await loan.save({ transaction: t });

        // 🔔 Send notification
        await createNotification({
            userId: loan.userId,
            type: 'success',
            title: 'Loan Disbursed',
            message: `Your loan of ₦${parseFloat(loan.amount).toLocaleString()} has been disbursed successfully.`,
            referenceId: loan.id,
            referenceType: 'Loan'
        });

        await t.commit();

        res.status(200).json({ message: 'Loan disbursed and account updated successfully', loan });
    } catch (error) {
        await t.rollback();
        console.error('Error disbursing loan:', error);
        res.status(500).json({ message: 'Failed to disburse loan', error: error.message });
    }
};
