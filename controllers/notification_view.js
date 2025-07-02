const { Op } = require('sequelize');
const { Notification } = require('../models');

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({ order: [['created', 'DESC']] });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['created', 'DESC']],
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByPk(notificationId);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const isRead = status === 'read';
        const notifications = await Notification.findAll({
            where: { isRead },
            order: [['created', 'DESC']]
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByPk(notificationId);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getLatestByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const notification = await Notification.findOne({
            where: { userId },
            order: [['created', 'DESC']]
        });
        if (!notification) return res.status(404).json({ message: 'No notifications found' });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getUnreadByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.findAll({
            where: { userId, isRead: false },
            order: [['created', 'DESC']]
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.clearAllByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.destroy({ where: { userId } });
        res.status(200).json({ message: 'All notifications cleared for user' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { title, message, priority } = req.body;

        const notification = await Notification.findByPk(notificationId);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        notification.title = title || notification.title;
        notification.message = message || notification.message;
        notification.priority = priority || notification.priority;
        await notification.save();

        res.status(200).json({ message: 'Notification updated', notification });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.destroy({ where: { id: notificationId } });
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
