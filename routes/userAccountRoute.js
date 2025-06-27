const express = require('express');
const router = express.Router();
const UserAccountController = require('../controllers/userAccount_view');
const validateJointAccount = require('../Middleware/validateJointAccount');

router.post('/create-joint', validateJointAccount, UserAccountController.create);
router.get('/all', UserAccountController.getAllJointAccounts);
router.get('/:id', UserAccountController.getJointAccountById);
router.put('/:id/update', UserAccountController.updateJointAccount);
router.delete('/:id/delete', UserAccountController.deleteJointAccount);

module.exports = router;