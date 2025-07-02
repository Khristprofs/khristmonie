const { Account, Transaction, Card, Branch } = require('../models');
// const { handleTransaction } = require('../Helpers/transactionHelper');
const { createNotification } = require('../Helpers/notificationHelper');
const sequelize = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const {
    updateBalances,
    notifyTransferParties
} = require('../Helpers/transactionUtils');
const bcrypt = require('bcrypt');

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
            toAccountId,
            transferPin,
            cardId,
            cardPin
        } = req.body;

        // 🔐 Validate transfer pin for transfers
        if (transactionType === 'transfer') {
            if (!transferPin) {
                return res.status(400).json({ message: 'Transfer pin is required for transfers' });
            }

            const fromAccount = await Account.findByPk(fromAccountId);
            if (!fromAccount) {
                return res.status(404).json({ message: 'Sender account not found' });
            }

            const isMatch = await bcrypt.compare(transferPin, fromAccount.transferPin);
            if (!isMatch) {
                return res.status(403).json({ message: 'Invalid transfer pin' });
            }
        }

        // 🔐 Validate card pin for ATM, POS, and online withdrawals
        if (
            transactionType === 'withdrawal' &&
            ['atm_withdrawal', 'pos_withdrawal', 'online_withdrawal'].includes(channel)
        ) {
            if (!cardId || !cardPin) {
                return res.status(400).json({ message: 'Card ID and PIN are required for this withdrawal channel' });
            }

            const card = await Card.findByPk(cardId);
            if (!card) {
                return res.status(404).json({ message: 'Card not found' });
            }

            const isCardPinValid = await bcrypt.compare(cardPin, card.pin);
            if (!isCardPinValid) {
                return res.status(403).json({ message: 'Invalid card PIN' });
            }
        }

        // 📄 Create transaction
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
            status: 'completed'
        };

        const newTransaction = await Transaction.create(transactionData, { transaction: t });

        // 💰 Update account balances
        await updateBalances({ transactionType, amount, fromAccountId, toAccountId }, t);

        // 🔔 Notify users
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
                transactionType,
                amount,
                currency,
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
        res.status(500).json({
            message: 'Failed to complete transaction',
            error: error.message
        });
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

exports.getAllTransactionsByBank = async (req, res) => {
    try {
        const { bankId } = req.params;
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: Account,
                    as: 'account',
                    include: [
                        {
                            model: Branch,
                            as: 'branch',
                            where: { bankId } // filter branches by bank
                        }
                    ]
                }
            ],
            order: [['created', 'DESC']]
        });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this bank' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions by bank:', error);
        res.status(500).json({ message: 'Failed to get transactions for bank', error: error.message });
    }
};

exports.getAllTransactionsByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { branchId }
                }
            ],
            order: [['created', 'DESC']]
        });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this branch' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions by branch:', error);
        res.status(500).json({ message: 'Failed to get transactions for branch', error: error.message });
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
