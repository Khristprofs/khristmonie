const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_view');

router.post('/create', userController.createUser);
router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/role/:role', userController.getUsersByRole);
router.get('/bank/:bankId', userController.getUsersByBank);
router.get('/branch/:branchId', userController.getUsersByBranch);
router.put('/:id/update', userController.updateUser);
router.delete('/:id/delete', userController.deleteUser);

module.exports = router;
