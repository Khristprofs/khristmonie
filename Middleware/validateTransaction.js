module.exports = (req, res, next) => {
    const { transactionType, amount } = req.body;
    if (!['deposit', 'withdrawal', 'transfer'].includes(transactionType)) {
        return res.status(400).json({ message: 'Invalid transaction type' });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transaction amount' });
    }

    next();
};