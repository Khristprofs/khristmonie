const refreshController = require('../controllers/refresh_view');
const express = require('express');
const router = express.Router();

router.post('/', refreshController.handleRefreshToken)

module.exports = router