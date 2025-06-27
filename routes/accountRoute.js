const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account_view');


router.post('/create', accountController.createAccount);
router.get('/all', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.get('/user/:userId', accountController.getAccountsByUserId);
router.get('/branch/:branchId', accountController.getAccountsByBranchId);
router.get('/status/:status', accountController.getAccountsByStatus);
router.get('/currency/:currency', accountController.getAccountsByCurrency);
router.get('/type/:accountType', accountController.getAccountsByAccountType);
router.put('/:id/update', accountController.updateAccount);
router.delete('/:id/delete', accountController.deleteAccount);

module.exports = router;