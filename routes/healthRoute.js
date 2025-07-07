const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.status(200).json({
            status: 'ok',
            message: 'Server is healthy',
            db: 'connected'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Database not reachable',
            db: 'disconnected',
            error: err.message
        });
    }
});

module.exports = router;
