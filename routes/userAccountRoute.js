const express = require('express');
const router = express.Router();
const UserAccountController = require('../controllers/userAccount_view');
const validateJointAccount = require('../Middleware/validateJointAccount');
const validateTransaction = require('../Middleware/validateTransaction');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

router.post('/create-joint', validateJointAccount, UserAccountController.create);
router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
        ),
        UserAccountController.getAllJointAccounts
    );
router.route('/:bankId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        UserAccountController.getAllJointAccountsByBank
    )
router.route('/:branchId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
        ),
        UserAccountController.getAllJointAccountsByBranch
    )
router.route('/:id')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer_service,
            rolesList.customer
        ),
        UserAccountController.getJointAccountById
    )
router.route('/:id/update')
    .put(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
        ),
        UserAccountController.updateJointAccount
    )
router.route('/:id/delete')
    .delete(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
        ),
        UserAccountController.deleteJointAccount
    )

module.exports = router;