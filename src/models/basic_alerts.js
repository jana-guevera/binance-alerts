const mongoose = require("mongoose");

const basicAlertScheme = mongoose.Schema({
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
    }
});

const BasicAlert = mongoose.model("BasicAlert", basicAlertScheme);

module.exports = BasicAlert;