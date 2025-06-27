const { Account, Transaction } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.handleTransaction = async ({ type, amount, fromAccount, toAccount, userId, channel, description }) => {
    let transactionData = {
        userId,
        transactionType: type,
        amount,
        currency: fromAccount.currency,
        channel,
        description,
        reference: uuidv4(),
        status: 'pending',
        accountId: fromAccount.id,
        fromAccountId: fromAccount.id,
        toAccountId: toAccount?.id || null
    };

    if (type === 'deposit') {
        fromAccount.balance = parseFloat(fromAccount.balance) + parseFloat(amount);
    } else if (type === 'withdrawal') {
        if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
            throw new Error('Insufficient funds');
        }
        fromAccount.balance = parseFloat(fromAccount.balance) - parseFloat(amount);
    } else if (type === 'transfer') {
        if (!toAccount) throw new Error('Target account is required for transfers');
        if (fromAccount.id === toAccount.id) throw new Error('Cannot transfer to the same account');
        if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
            throw new Error('Insufficient funds');
        }
        fromAccount.balance -= parseFloat(amount);
        toAccount.balance += parseFloat(amount);
    }

    await fromAccount.save();
    if (toAccount) await toAccount.save();

    transactionData.status = 'completed';
    return await Transaction.create(transactionData);
};
