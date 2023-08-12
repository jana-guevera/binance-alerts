const mongoose = require("mongoose");

const emaScheme = mongoose.Schema({
    time: String,
    direction: String,
    emaRange: Number
});

const emaTargetAlertScheme = mongoose.Schema({
    coinName:{
        type: String,
        required: true
    },
    targetPrice:{
        type: Number,
    },
    direction:{
        type: String
    },
    note:{
        type: String
    },
    dateAdded: {
        type: Date,
        required: true
    },
    isTargetPriceHit:{
        type: Boolean,
        default: false
    },
    emaTargets: [emaScheme]
});

const EmaTargetAlert = mongoose.model("EmaTargetAlert", emaTargetAlertScheme);

module.exports = EmaTargetAlert;