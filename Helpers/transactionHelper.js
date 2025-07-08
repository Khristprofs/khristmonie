const { Account, Transaction } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.handleTransaction = async ({
    type,
    amount,
    fromAccountNumber,
    toAccountNumber,
    userId,
    channel,
    description,
    transaction
}) => {
    const fromAccount = await Account.findOne({
        where: { accountNumber: fromAccountNumber },
        transaction
    });

    const toAccount = toAccountNumber
        ? await Account.findOne({ where: { accountNumber: toAccountNumber }, transaction })
        : null;

    if (!fromAccount) throw new Error('Sender account not found');

    const transactionData = {
        userId,
        transactionType: type,
        amount,
        currency: fromAccount.currency,
        channel,
        description,
        reference: uuidv4(),
        status: 'pending',
        accountId: fromAccount.id,
        fromAccountNumber,
        toAccountNumber
    };

    if (type === 'deposit') {
        fromAccount.balance += parseFloat(amount);
    } else if (type === 'withdrawal') {
        if (fromAccount.balance < parseFloat(amount)) throw new Error('Insufficient funds');
        fromAccount.balance -= parseFloat(amount);
    } else if (type === 'transfer') {
        if (!toAccount) throw new Error('Target account required');
        if (fromAccount.accountNumber === toAccount.accountNumber) throw new Error('Cannot transfer to same account');
        if (fromAccount.balance < parseFloat(amount)) throw new Error('Insufficient funds');
        fromAccount.balance -= parseFloat(amount);
        toAccount.balance += parseFloat(amount);
    }

    await fromAccount.save({ transaction });
    if (toAccount) await toAccount.save({ transaction });

    transactionData.status = 'completed';
    return await Transaction.create(transactionData, { transaction });
};
