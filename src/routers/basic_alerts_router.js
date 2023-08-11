const express = require("express");

const BasicAlert = require("../models/basic_alerts.js");

const router = new express.Router();

router.post("/basic-alerts", async (req, res) => {
    try{
        const existAlert = await BasicAlert.findOne({
            coinName: req.body.coinName,
            targetPrice: req.body.targetPrice
        });

        if(existAlert){
            return res.send({error: "Alert already exist."});
        }
        
        const basicAlert = new BasicAlert(req.body);
        await basicAlert.save();
        res.send(basicAlert);
    }catch(e){
        console.log(e.message);
        res.send({error: "Something went wrong! Unable to add alert."});
    }
}); 

router.get("/basic-alerts", async (req, res) => {
    try{
        basicAlerts = await BasicAlert.find({});

        res.send(basicAlerts);
    }catch(e){
        res.send({error: e.message});
    }
});

router.delete("/basic-alerts/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const basicAlert = await BasicAlert.findByIdAndDelete({_id: _id});

        if(!basicAlert){
            return res.send({error: "Alert not found."});
        }

        res.send(basicAlert);
    }catch(e){
        res.send({error: "Something went wrong! Unable to delete alert."});
    }
});

module.exports = router;