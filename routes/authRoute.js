const authController = require('../controllers/auth_view');
const express = require('express');

const router = express.Router();

router.post('/login', authController.login);

module.exports = router;