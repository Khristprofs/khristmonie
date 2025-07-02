const { LoanRepayment, Loan, User, Account, Card } = require('../models');
const { createNotification } = require('../Helpers/notificationHelper');
const { sequelize } = require('../models');
const bcrypt = require('bcrypt');

exports.createRepayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      loanId,
      amount,
      repaymentMethod,
      paidBy,
      accountId,
      cardId,
      pin
    } = req.body;

    if (!loanId || !amount || !repaymentMethod || !paidBy || !pin) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const loan = await Loan.findByPk(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const payAmount = parseFloat(amount);
    const monthly = parseFloat(loan.monthlyPayment);
    const termMonths = parseInt(loan.termMonths);
    const totalToPay = parseFloat((monthly * termMonths).toFixed(2));
    const remaining = parseFloat(loan.balance);

    // VALIDATION BLOCK
    const isMonthlyPayment = payAmount.toFixed(2) === monthly.toFixed(2);
    const isFinalPayment = payAmount.toFixed(2) === totalToPay.toFixed(2);

    if (!isMonthlyPayment && !isFinalPayment) {
      return res.status(400).json({
        message: `Invalid repayment amount. Must be either monthly (₦${monthly}) or full (₦${totalToPay})`
      });
    }

    // Check remaining balance covers this payment
    if (payAmount > remaining) {
      return res.status(400).json({ message: 'Payment exceeds remaining loan balance' });
    }

    // Validate PIN and deduct from account
    let account = null;
    let isValidPin = false;

    if (['bank_transfer', 'mobile_money'].includes(repaymentMethod)) {
      account = await Account.findOne({ where: { id: accountId, userId: paidBy } });
      if (!account) return res.status(404).json({ message: 'Account not found' });

      isValidPin = await bcrypt.compare(pin, account.transferPin);
      if (!isValidPin) return res.status(403).json({ message: 'Invalid transfer pin' });

    } else if (repaymentMethod === 'card') {
      const card = await Card.findOne({ where: { id: cardId, accountId } });
      if (!card) return res.status(404).json({ message: 'Card not found' });

      isValidPin = await bcrypt.compare(pin, card.pin);
      if (!isValidPin) return res.status(403).json({ message: 'Invalid card pin' });

      account = await Account.findByPk(card.accountId);
      if (!account) return res.status(404).json({ message: 'Linked card account not found' });
    }

    if (parseFloat(account.balance) < payAmount) {
      return res.status(400).json({ message: 'Insufficient account balance' });
    }

    // Deduct from account
    account.balance -= payAmount;
    await account.save({ transaction: t });

    // Record repayment
    const repayment = await LoanRepayment.create({
      loanId,
      amount: payAmount,
      repaymentMethod,
      status: 'successful',
      paidBy
    }, { transaction: t });

    // Update loan balance
    loan.balance = parseFloat((remaining - payAmount).toFixed(2));
    if (loan.balance <= 0) {
      loan.status = 'paid';
      loan.completedAt = new Date();
    }

    await loan.save({ transaction: t });

    // Send notification
    await createNotification({
      userId: paidBy,
      type: 'success',
      title: 'Loan Repayment Successful',
      message: `You repaid ₦${payAmount}. Loan balance is now ₦${loan.balance}`,
      referenceId: repayment.id,
      referenceType: 'LoanRepayment'
    });

    await t.commit();
    res.status(201).json({ message: 'Repayment successful', repayment });

  } catch (error) {
    await t.rollback();
    console.error('Repayment Error:', error);
    res.status(500).json({ message: 'Repayment failed', error: error.message });
  }
};

exports.getAllRepayments = async (req, res) => {
  try {
    const repayments = await LoanRepayment.findAll({
      include: ['loan', 'payer'],
      order: [['created', 'DESC']],
    });

    res.status(200).json(repayments);
  } catch (error) {
    console.error('Error fetching repayments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllRepaymentsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    const repayments = await LoanRepayment.findAll({
      include: [
        {
          model: Loan,
          as: 'loan',
          include: {
            model: User,
            as: 'user',
            include: {
              model: Account,
              as: 'accounts',
              where: { bankId },
              attributes: ['id', 'accountNumber', 'bankId']
            }
          }
        }
      ],
      order: [['created', 'DESC']]
    });

    if (!repayments.length) {
      return res.status(404).json({ message: 'No loan repayments found for this bank' });
    }

    res.status(200).json(repayments);
  } catch (error) {
    console.error('Error fetching repayments by bank:', error);
    res.status(500).json({ message: 'Failed to fetch loan repayments', error: error.message });
  }
};

exports.getAllRepaymentsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const repayments = await LoanRepayment.findAll({
      include: [
        {
          model: Loan,
          as: 'loan',
          include: {
            model: User,
            as: 'user',
            include: {
              model: Account,
              as: 'accounts',
              where: { branchId },
              attributes: ['id', 'accountNumber', 'branchId']
            }
          }
        }
      ],
      order: [['created', 'DESC']]
    });

    if (!repayments.length) {
      return res.status(404).json({ message: 'No loan repayments found for this branch' });
    }

    res.status(200).json(repayments);
  } catch (error) {
    console.error('Error fetching repayments by branch:', error);
    res.status(500).json({ message: 'Failed to fetch loan repayments', error: error.message });
  }
};


exports.getRepaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const repayments = await LoanRepayment.findAll({
      where: { paidBy: userId },
      include: ['loan'],
      order: [['created', 'DESC']],
    });

    if (!repayments.length) {
      return res.status(404).json({ message: 'No repayments found for this user' });
    }

    res.status(200).json(repayments);
  } catch (error) {
    console.error('Error fetching user repayments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateRepayment = async (req, res) => {
  try {
    const { repaymentId } = req.params;
    const updates = req.body;

    const repayment = await LoanRepayment.findByPk(repaymentId);
    if (!repayment) {
      return res.status(404).json({ message: 'Repayment not found' });
    }

    await repayment.update(updates);

    res.status(200).json({ message: 'Repayment updated', repayment });
  } catch (error) {
    console.error('Error updating repayment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteRepayment = async (req, res) => {
  try {
    const { repaymentId } = req.params;

    const repayment = await LoanRepayment.findByPk(repaymentId);
    if (!repayment) {
      return res.status(404).json({ message: 'Repayment not found' });
    }

    await repayment.destroy();

    res.status(200).json({ message: 'Repayment deleted successfully' });
  } catch (error) {
    console.error('Error deleting repayment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};