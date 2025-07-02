const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

router.route('/create')
    .post(
        authenticateToken,
        verifyRoles(rolesList.admin),
        branchController.createBranch
    );
router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(rolesList.admin),
        branchController.getAllBranches
    );
router.route('/:bankId/all')
    .get(
        authenticateToken,
        verifyRoles(rolesList.admin, rolesList.bank_admin),
        branchController.getAllBranchesByBank
    );
router.route('/:id/')
    .get(
        authenticateToken,
        verifyRoles(rolesList.admin, rolesList.bank_admin),
        branchController.getBranchById
    );
router.route('/:id/update')
    .put(
        authenticateToken,
        verifyRoles(rolesList.admin, rolesList.bank_admin),
        branchController.updateBranch
    );
router.route('/:id/delete')
    .delete(
        authenticateToken,
        verifyRoles(rolesList.admin, rolesList.bank_admin),
        branchController.deleteBranch
    );

module.exports = router;