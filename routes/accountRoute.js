const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');


router.route('/create')
    .post(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.staff,
            rolesList.bank_admin,
            rolesList.customer_service,
            rolesList.customer
        ),
        accountController.createAccount
    )
router.route('/all')
    .get(
        authenticateToken, 
        verifyRoles(
            rolesList.admin,
        ), 
        accountController.getAllAccounts
    );
router.route('/:bankId/all')
    .get(
        authenticateToken, 
        verifyRoles(
            rolesList.admin, 
            rolesList.staff, 
            rolesList.bank_admin, 
            rolesList.customer_service
        ), 
        accountController.getAllAccountsByBank
    );
router.route('/:id')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.staff,
            rolesList.bank_admin,
            rolesList.customer_service,
            rolesList.customer
        ),
        accountController.getAccountById
    );
router.route('/user/:userId')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.customer,
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer_service
        ),
        accountController.getAccountsByUserId
    );
router.route('/branch/:branchId')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer_service
        ),
        accountController.getAccountsByBranchId
    );
router.route('/status/:status')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer_service
        ),
        accountController.getAccountsByStatus
    );
router.route('/currency/:currency')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer_service
        ),
        accountController.getAccountsByCurrency
    )
router.route('/type/:accountType')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer_service
        ),
        accountController.getAccountsByAccountType
    )
router.route('/:id/update')
    .put(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.staff,
            rolesList.bank_admin,
        ),
        accountController.updateAccount
    );
router.route('/:id/delete')
    .delete(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.staff,
            rolesList.bank_admin,
        ),
        accountController.deleteAccount
    );

module.exports = router;