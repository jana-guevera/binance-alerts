const express = require("express");
const sendAlertEmail = require("../utils/email");

const Notification = require("../models/notifications.js");

const router = new express.Router();

router.post("/notifications", async (req, res) => {
    try{
        const existing = await Notification.findById({_id: req.body._id});

        if(existing){
            return res.send({error: "Notification already exist."});
        }

        const notification = new Notification(req.body);
        await notification.save();
        res.send(notification);

        sendAlertEmail({
            email: "bhagi95ozarah@gmail.com",
            subject: "Target Price Hit",
            message: req.body.message
        });
    }catch(e){
        console.log(e.message);
        res.send({error: "Something went wrong! Unable to add notification."});
    }
}); 

router.get("/notifications", async (req, res) => {
    try{
        notifications = await Notification.find({});
        res.send(notifications);
    }catch(e){
        res.send({error: "Something went wrong! Unable to fetch notifications."});
    }
});

router.delete("/notifications/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const notification = await Notification.findByIdAndDelete({_id: _id});

        if(!notification){
            return res.send({error: "Alert not found."});
        }

        res.send(notification);
    }catch(e){
        res.send({error: "Something went wrong! Unable to delete notification."});
    }
});

module.exports = router;