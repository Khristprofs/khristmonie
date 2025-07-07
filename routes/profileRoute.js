const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

router.post('/create', profileController.createProfile);
router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
        ),
        profileController.getAllProfiles
    )
router.route('/:bankId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        profileController.getProfilesByBank
    )
router.route('/:branchId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        profileController.getProfilesByBranch
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
        profileController.getProfileById
    );
router.route('/:id/update')
    .put(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff,
            rolesList.customer
        ),
        profileController.updateProfile
    )
router.route('/:id/delete')
    .delete(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff
        ),
        profileController.deleteProfile
    )

module.exports = router;