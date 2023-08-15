const sendAlertEmail = require("../utils/email");
const Notification = require("../models/notifications.js");

const addNotification = async (notif) => {
    const existing = await Notification.findById({_id: notif._id});

    if(existing){
        throw Error("Notification already exist!");
    }

    const notification = new Notification(notif);
    await notification.save();
    await sendAlertEmail({
        email: "bhagi95ozarah@gmail.com",
        subject: "Target Price Hit",
        message: notif.message
    });
    return notification;
}

const getNotifications = async () => {
    const notifications = await Notification.find({});
    return notifications;
}

module.exports = {
    addNotification: addNotification,
    getNotifications: getNotifications
};