const express = require('express');
const authController = require('../controllers/auth_view');
const auth = require('../Middleware/auth');

const router = express.Router();

router.post('/login', authController.login);

router.get(
    '/me',
    auth,
    authController.getCurrentUser
);

module.exports = router;