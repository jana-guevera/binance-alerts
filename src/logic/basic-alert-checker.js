const BasicAlert = require("../models/basic_alerts.js");
const notification = require("../logic/notification.js");

const checkCondition = async (coinsPriceList) => {
    var alerts = await BasicAlert.find({});
    
    for(var i = 0; i < alerts.length; i++){
        if(!coinsPriceList[alerts[i].coinName]){
            continue;
        }

        var currentAlert = alerts[i];
        var currentPrice = parseFloat(coinsPriceList[currentAlert.coinName].price);
        var notif = {
            _id: currentAlert._id,
            coinName: currentAlert.coinName, 
            targetPrice: currentAlert.targetPrice, 
            direction: currentAlert.direction, 
            note:currentAlert.note,
            dateAdded: currentAlert.dateAdded,
            alertType: "basic",
        };

        if(currentAlert.direction === "up" && currentPrice >= currentAlert.targetPrice){
            notif.message = notif.coinName + " has gone up to the target price of " + currentAlert.targetPrice;
            await notification.addNotification(notif);
            await BasicAlert.findByIdAndDelete({_id: currentAlert._id});
        }else if(currentAlert.direction === "down" && currentPrice <= currentAlert.targetPrice){
            notif.message = notif.coinName + " has gone down to the target price of " + currentAlert.targetPrice;
            await notification.addNotification(notif);
            await BasicAlert.findByIdAndDelete({_id: currentAlert._id});
        }
    }

    alerts = await BasicAlert.find({});
    return alerts;
}

module.exports = checkCondition;
