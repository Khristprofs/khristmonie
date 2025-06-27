const { Account, Transaction } = require('../models');
// const { handleTransaction } = require('../Helpers/transactionHelper');
const { createNotification } = require('../Helpers/notificationHelper');
const sequelize = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const {
    updateBalances,
    notifyTransferParties
} = require('../Helpers/transactionUtils');

exports.createTransaction = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            userId,
            accountId,
            transactionType,
            amount,
            currency,
            channel,
            description,
            fromAccountId,
            toAccountId
        } = req.body;

        const reference = uuidv4();

        const transactionData = {
            userId,
            accountId,
            transactionType,
            amount,
            currency: currency || 'NGN',
            channel,
            description,
            fromAccountId: transactionType !== 'deposit' ? fromAccountId : null,
            toAccountId: transactionType !== 'withdrawal' ? toAccountId : null,
            reference,
            status: 'completed',
        };

        const newTransaction = await Transaction.create(transactionData, { transaction: t });

        await updateBalances({ transactionType, amount, fromAccountId, toAccountId }, t);

        if (transactionType === 'transfer') {
            const from = await Account.findByPk(fromAccountId);
            const to = await Account.findByPk(toAccountId);
            await notifyTransferParties({
                fromAccount: from,
                toAccount: to,
                amount,
                transactionId: newTransaction.id
            }, t);
        } else {
            await createNotification({
                userId,
                type: 'info',
                title: `${transactionType.toUpperCase()} - $${amount}`,
                message: `Your ${transactionType} of $${amount} was successful.`,
                referenceId: newTransaction.id
            }, t);
        }

        await t.commit();

        res.status(201).json({
            message: 'Transaction completed successfully',
            transaction: newTransaction
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Failed to complete transaction', error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Fetch Transactions Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};

exports.getTransactionById = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transaction.findByPk(id, {
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error('Fetch Transaction Error:', error);
        res.status(500).json({ message: 'Failed to fetch transaction', error: error.message });
    }
};

exports.getTransactionsByAccountId = async (req, res) => {
    const { accountId } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: {
                accountId
            },
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this account' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Fetch Transactions by Account Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions for this account', error: error.message });
    }
};

exports.getTransactionsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: {
                userId
            },
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this user' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Fetch Transactions by User Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions for this user', error: error.message });
    }
};

exports.getTransactionsByType = async (req, res) => {
    const { type } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: {
                transactionType: type
            },
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: `No transactions found for type ${type}` });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Fetch Transactions by Type Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions by type', error: error.message });
    }
};

exports.getTransactionsByChannel = async (req, res) => {
    const { channel } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: {
                channel
            },
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: `No transactions found for channel ${channel}` });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Fetch Transactions by Channel Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions by channel', error: error.message });
    }
};

exports.getTransactionsByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                { model: Account, as: 'fromAccount' },
                { model: Account, as: 'toAccount' }
            ]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this date range' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Fetch Transactions by Date Range Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions for this date range', error: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { amount, description } = req.body;

    try {
        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.amount = amount || transaction.amount;
        transaction.description = description || transaction.description;

        await transaction.save();

        res.status(200).json({
            message: 'Transaction updated successfully',
            transaction
        });
    } catch (error) {
        console.error('Update Transaction Error:', error);
        res.status(500).json({ message: 'Failed to update transaction', error: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.destroy();

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete Transaction Error:', error);
        res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
    }
};
