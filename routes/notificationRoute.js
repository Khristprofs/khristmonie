const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');


router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        notificationController.getAllNotifications
    )
router.get('/all-user/:userId', notificationController.getUserNotifications);
router.get('/:notificationId', notificationController.getNotificationById);
router.get('/by-status/:status', notificationController.getByStatus);
router.post('/mark-read/:notificationId', notificationController.markAsRead);
router.get('/latest/:userId', notificationController.getLatestByUser);
router.get('/unread/:userId', notificationController.getUnreadByUser);
router.delete('/clear/:userId', notificationController.clearAllByUser);
router.put('/update/:notificationId', notificationController.updateNotification);
router.delete('/delete/:notificationId', notificationController.deleteNotification);

module.exports = router;