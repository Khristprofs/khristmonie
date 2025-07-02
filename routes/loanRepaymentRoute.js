const express = require('express');
const router = express.Router();
const repaymentController = require('../controllers/loanRepayment_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

router.route('/create')
    .post(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer
        ),
        repaymentController.createRepayment
    );
router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
        ),
        repaymentController.getAllRepayments
    );
router.route('/:bankId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        repaymentController.getAllRepaymentsByBank
    );
router.route('/:branchId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        repaymentController.getAllRepaymentsByBranch
    );
router.route('/user/:userId')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer // Only if they're accessing their own repayments
        ),
        repaymentController.getRepaymentsByUser
    );
router.route('/:repaymentId/update')
    .put(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer // Only if they're updating their own repayments
        ),
        repaymentController.updateRepayment
    );
router.route('/:repaymentId/delete')
    .delete(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
        ),
        repaymentController.deleteRepayment
    );

module.exports = router;
