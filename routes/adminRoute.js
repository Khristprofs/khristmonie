const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

// Protect this route if needed
router.get('/stats', authenticateToken, verifyRoles(rolesList.admin), adminController.getStats);
router.get('/bank-stats', authenticateToken, verifyRoles(rolesList.admin), adminController.getBankStats);

module.exports = router;
