const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction_view');
const validateTransaction = require('../Middleware/validateTransaction');

router.post('/create', validateTransaction, transactionController.createTransaction);
router.get('/all', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);
router.get('/account/:accountId', transactionController.getTransactionsByAccountId);
router.get('/channel/:channel', transactionController.getTransactionsByChannel);
router.get('/date-range', transactionController.getTransactionsByDateRange);
router.get('/type/:type', transactionController.getTransactionsByType);
router.get('/user/:userId', transactionController.getTransactionsByUserId);
router.put('/:id/update', transactionController.updateTransaction);
router.delete('/:id/delete', transactionController.deleteTransaction);

module.exports = router;