// controllers/adminStatsController.js
const { Bank, Branch, User, Account, Transaction, Loan } = require('../../models');
const { Op } = require('sequelize');

exports.getBankStats = async (req, res) => {
    try {
        const bankAdmin = req.user;
        const bankId = bankAdmin.bankId;

        if (!bankId) {
            return res.status(400).json({ message: 'Bank ID missing from admin account.' });
        }

        const bank = await Bank.findByPk(bankId);
        if (!bank) {
            return res.status(404).json({ message: 'Bank not found.' });
        }

        const branches = await Branch.findAll({ where: { bankId } });
        const users = await User.count({ where: { bankId } });
        const accounts = await Account.count({ where: { bankId } });
        const transactions = await Transaction.count({ where: { bankId } });
        const loans = await Loan.count({ where: { bankId } });

        const topBranches = await Branch.findAll({
            where: { bankId },
            include: [
                { model: Account, attributes: [] },
                { model: Transaction, attributes: [] }
            ],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('accounts.id')), 'accounts'],
                [sequelize.fn('COUNT', sequelize.col('transactions.id')), 'transactions']
            ],
            group: ['Branch.id'],
            limit: 5
        });

        const chartData = await Transaction.findAll({
            where: { bankId },
            attributes: [
                [sequelize.fn('to_char', sequelize.col('createdAt'), 'Mon'), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'transactions']
            ],
            group: ['month'],
            order: [[sequelize.fn('to_char', sequelize.col('createdAt'), 'MM'), 'ASC']]
        });

        const recentActivity = await Transaction.findAll({
            where: { bankId },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        const activityLog = recentActivity.map(tx => `Transaction of ₦${tx.amount} via ${tx.channel || 'web'}`);

        return res.json({
            bank,
            stats: { branches: branches.length, users, accounts, transactions, loans },
            chartData,
            topBranches,
            recentActivity: activityLog
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch bank stats' });
    }
};
