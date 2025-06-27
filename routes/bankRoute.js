const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank_view');

router.post('/create', bankController.createBank);
router.get('/get', bankController.getAllBanks);
router.get('/:id', bankController.getBankById);
router.put('/:id/update', bankController.updateBank);
router.delete('/:id/delete', bankController.deleteBank);



module.exports = router;