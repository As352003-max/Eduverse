const { io } = require('../server');

const sendNotification = (userId, type, message, data = {}) => {
    if (io) {
        io.to(userId).emit('notification', {
            type,
            message,
            data,
            timestamp: new Date(),
        });
    } else {
        console.warn('Socket.IO instance not available for notification.');
    }
};

module.exports = { sendNotification };