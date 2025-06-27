const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch_view');

router.post('/create', branchController.createBranch);
router.get('/all', branchController.getAllBranches);
router.get('/:id/', branchController.getBranchById);
router.put('/:id/update', branchController.updateBranch);
router.delete('/:id/delete', branchController.deleteBranch);

module.exports = router;