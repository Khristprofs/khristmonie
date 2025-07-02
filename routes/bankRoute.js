const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

router.route('/create')
    .post(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin
        ),
        bankController.createBank
    )
router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
        ),
        bankController.getAllBanks
    );
router.route('/:id')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.customer_service
        ),
        bankController.getBankById
    )
router.route('/:id/update')
    .put(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin
        ),
    bankController.updateBank
);
router.route('/:id/delete')
    .delete(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin
        ),
        bankController.deleteBank
    );

module.exports = router;