const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_view');

router.post('/create', profileController.createProfile);
router.get('/all', profileController.getAllProfiles);
router.get('/:id', profileController.getProfileById);
router.put('/:id/update', profileController.updateProfile);
router.delete('/:id/delete', profileController.deleteProfile);

module.exports = router;