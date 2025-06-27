const { Account, Notification } = require('../models');

const updateBalances = async ({ transactionType, amount, fromAccountId, toAccountId }, transaction) => {
    amount = parseFloat(amount);

    if (transactionType === 'deposit') {
        const toAccount = await Account.findByPk(toAccountId, { transaction });
        if (!toAccount) throw new Error('Destination account not found');
        await toAccount.increment('balance', { by: amount, transaction });
    }

    if (transactionType === 'withdrawal') {
        const fromAccount = await Account.findByPk(fromAccountId, { transaction });
        if (!fromAccount) throw new Error('Source account not found');
        if (parseFloat(fromAccount.balance) < amount) throw new Error('Insufficient funds');
        await fromAccount.decrement('balance', { by: amount, transaction });
    }

    if (transactionType === 'transfer') {
        const from = await Account.findByPk(fromAccountId, { transaction });
        const to = await Account.findByPk(toAccountId, { transaction });

        if (!from || !to) throw new Error('One or both accounts not found');
        if (parseFloat(from.balance) < amount) throw new Error('Insufficient funds');

        await from.decrement('balance', { by: amount, transaction });
        await to.increment('balance', { by: amount, transaction });
    }
};

const createNotification = async ({
    userId,
    type,
    title,
    message,
    referenceId,
}, transaction) => {
    await Notification.create({
        userId,
        type,
        title,
        message,
        referenceId,
        referenceType: 'Transaction',
        channel: 'in-app',
    }, { transaction });
};

// New: Notify both sender and receiver in transfer
const notifyTransferParties = async ({ fromAccount, toAccount, amount, transactionId }, transaction) => {
    await createNotification({
        userId: fromAccount.userId,
        type: 'info',
        title: 'Transfer Sent',
        message: `You transferred $${amount} to account number ${toAccount.accountNumber}`,
        referenceId: transactionId
    }, transaction);

    await createNotification({
        userId: toAccount.userId,
        type: 'info',
        title: 'Transfer Received',
        message: `You received $${amount} from account number ${fromAccount.accountNumber}`,
        referenceId: transactionId
    }, transaction);
};

module.exports = {
    updateBalances,
    createNotification,
    notifyTransferParties
};