const { Account, Notification } = require('../models');

// ✅ Rewritten to use accountNumber instead of accountId
const updateBalances = async ({ transactionType, amount, fromAccountNumber, toAccountNumber }, t) => {
    const amt = parseFloat(amount);

    if (transactionType === 'deposit') {
        const account = await Account.findOne({
            where: { accountNumber: toAccountNumber },
            transaction: t
        });
        if (!account) throw new Error('Deposit account not found');

        account.balance = parseFloat(account.balance) + amt;
        await account.save({ transaction: t });
    }

    if (transactionType === 'withdrawal') {
        const account = await Account.findOne({
            where: { accountNumber: fromAccountNumber },
            transaction: t
        });
        if (!account) throw new Error('Withdrawal account not found');

        if (parseFloat(account.balance) < amt) throw new Error('Insufficient balance');
        account.balance = parseFloat(account.balance) - amt;
        await account.save({ transaction: t });
    }

    if (transactionType === 'transfer') {
        const from = await Account.findOne({
            where: { accountNumber: fromAccountNumber },
            transaction: t
        });

        const to = await Account.findOne({
            where: { accountNumber: toAccountNumber },
            transaction: t
        });

        if (!from || !to) throw new Error('One or both accounts not found');
        // 🚫 Currency mismatch
        if (from.currency !== to.currency) {
            throw new Error(`Currency mismatch: Sender has ${from.currency}, receiver has ${to.currency}`);
        }
        if (parseFloat(from.balance) < amt) throw new Error('Insufficient funds');

        from.balance = parseFloat(from.balance) - amt;
        to.balance = parseFloat(to.balance) + amt;

        await from.save({ transaction: t });
        await to.save({ transaction: t });
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

// ✅ No changes needed here (still works with updated Account models)
const notifyTransferParties = async ({ fromAccount, toAccount, amount, transactionId }, transaction) => {
    await createNotification({
        userId: fromAccount.userId,
        type: 'info',
        title: 'Transfer Sent',
        message: `You transferred ₦${amount} to account number ${toAccount.accountNumber}`,
        referenceId: transactionId
    }, transaction);

    await createNotification({
        userId: toAccount.userId,
        type: 'info',
        title: 'Transfer Received',
        message: `You received ₦${amount} from account number ${fromAccount.accountNumber}`,
        referenceId: transactionId
    }, transaction);
};

module.exports = {
    updateBalances,
    createNotification,
    notifyTransferParties
};
