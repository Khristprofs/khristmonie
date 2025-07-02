const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

// Public routes
router.post('/create', userController.createUser);

router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(rolesList.admin),
        userController.getAllUsers
    );

router.route('/:id')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.customer_service,
            rolesList.customer
        ),
        userController.getUserById
    );

router.get('/bank/:bankId',
    authenticateToken,
    verifyRoles(rolesList.admin, rolesList.bank_admin),
    userController.getUsersByBank
);

router.get('/branch/:branchId',
    authenticateToken,
    verifyRoles(rolesList.admin, rolesList.bank_admin, rolesList.staff),
    userController.getUsersByBranch
);
router.put('/:id/update',
    authenticateToken,
    verifyRoles(rolesList.admin, rolesList.bank_admin, rolesList.staff),
    userController.updateUser
);

router.delete('/:id/delete',
    authenticateToken,
    verifyRoles(rolesList.admin, rolesList.bank_admin, rolesList.staff),
    userController.deleteUser
);

router.get('/role/:role',
    authenticateToken,
    verifyRoles(rolesList.admin, rolesList.bank_admin),
    userController.getUsersByRole
);

module.exports = router;