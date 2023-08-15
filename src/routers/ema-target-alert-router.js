const express = require("express");

const EmaTargetAlert = require("../models/ema_target_alerts.js");

const router = new express.Router();

router.post("/ema-target-alerts", async (req, res) => {
    try{
        const existAlert = await EmaTargetAlert.findOne({
            coinName: req.body.coinName,
            targetPrice: req.body.targetPrice
        });

        if(existAlert){
            return res.send({error: "Alert already exist."});
        }
        
        const alert = new EmaTargetAlert(req.body);
        await alert.save();
        res.send(alert);
    }catch(e){
        res.send({error: "Something went wrong! Unable to add alert."});
    }
}); 

router.delete("/ema-target-alerts/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const alert = await EmaTargetAlert.findByIdAndDelete({_id: _id});

        if(!alert){
            return res.send({error: "Alert not found."});
        }

        res.send(alert);
    }catch(e){
        res.send({error: "Something went wrong! Unable to delete alert."});
    }
});

// router.get("/ema-target-alerts", async (req, res) => {
//     try{
//         alerts = await EmaTargetAlert.find({});

//         res.send(alerts);
//     }catch(e){
//         res.send({error: e.message});
//     }
// });

// router.patch("/ema-target-alerts", async (req, res) => {
//     const _id = req.body._id;

//     try{
//         const alert = await EmaTargetAlert.findByIdAndUpdate(
//             {_id: _id}, 
//             req.body, 
//             {new : true, runValidators: true}
//         );

//         if(!alert){
//             res.send({
//                 error: "Customer not found"
//             });
//         }

//         res.send(alert);
//     }catch(e){
//         res.send({error: e.message});
//     }
// });

// router.patch("/ema-target-alerts/update-or-delete/:emaTargetId", async (req, res) => {
//     const emaTargetId = req.params.emaTargetId;

//     try{
//         const alert = await EmaTargetAlert.findById(req.body._id);

//         if(!alert){
//             res.send({
//                 error: "Alert not found"
//             });
//         }

//         alert.emaTargets.id(emaTargetId).deleteOne();
//         await alert.save();

//         if(alert.emaTargets.length === 0){
//             await EmaTargetAlert.findByIdAndDelete(req.body._id);
//         }

//         res.send({_id: req.body._id});
//     }catch(e){
//         res.send({error: e.message});
//     }
// });

module.exports = router;