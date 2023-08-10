const mongoose = require("mongoose");

const notificationScheme = mongoose.Schema({
    coinName:{
        type: String,
        required: true
    },
    targetPrice:{
        type: Number,
        min:0
    },
    direction:{
        type: String,
        required: true
    },
    note:{
        type: String
    },
    dateAdded: {
        type: Date,
        required: true
    },
    alertType: {
        type: String,
        required: true
    },
    message:{
        type: String,
        require: true
    },
    dateTargetHit: {
        type: Date,
        default: new Date()
    }
});

const Notification = mongoose.model("Notification", notificationScheme);

module.exports = Notification;