const EmaTargetAlert = require("../models/ema_target_alerts.js");
const notification = require("../logic/notification.js");

const emaCalculator = require("../logic/ema-calculator.js");

const updateOrRemoveAlert = async (alertId, emaTargetId) => {
    const alert = await EmaTargetAlert.findById(alertId);
    alert.emaTargets.id(emaTargetId).deleteOne();
    await alert.save();

    if(alert.emaTargets.length === 0){
        await EmaTargetAlert.findByIdAndDelete(alertId);
    }
}

const temaCheckIfTargetPriceHit = async (coinsCurrentPrices) => {
    const temaAlerts = await EmaTargetAlert.find({});

    if(temaAlerts.length === 0){
        return;
    }

    for(var i = 0; i < temaAlerts.length; i++){
        var alert = temaAlerts[i];
        var currentPrice = parseFloat(coinsCurrentPrices[alert.coinName]);

        if(!alert.targetPrice && !alert.direction){
            continue;
        }

        if(alert.isTargetPriceHit){
            continue;
        }

        if(alert.direction === "up" && currentPrice >= alert.targetPrice){
            await EmaTargetAlert.findByIdAndUpdate(
                {_id: alert._id}, 
                {isTargetPriceHit: true}
            );
        }else if(alert.direction === "down" && currentPrice <= alert.targetPrice){
            await EmaTargetAlert.findByIdAndUpdate(
                {_id: alert._id}, 
                {isTargetPriceHit: true}
            );
        }
    }
}

const temaCalculateEmaForAlerts = async (coinsCurrentPrices) => {
    const temaAlerts = await EmaTargetAlert.find({});

    if(temaAlerts.length === 0){
        return;
    }

    for(var i = 0; i < temaAlerts.length; i++){
        var alert = temaAlerts[i];

        if(alert.targetPrice && alert.direction){
            if(!alert.isTargetPriceHit){
                continue;
            }
        }

        for(var j = 0; j < alert.emaTargets.length; j++){
            var emaTarget = alert.emaTargets[j];

            const candleData =  await emaCalculator.fetchCandleData(alert.coinName, emaTarget.time);
            const closingPrices = emaCalculator.getClosingPriceArray(candleData);
            const ema = emaCalculator.calculateEMA(closingPrices, emaTarget.emaRange);

            const currentPrice = parseFloat(coinsCurrentPrices[alert.coinName]);
            var notif = {
                _id: emaTarget._id,
                coinName: alert.coinName, 
                targetPrice: alert.targetPrice, 
                direction: alert.direction, 
                note:alert.note,
                dateAdded: alert.dateAdded,
                alertType: "tema",
            };

            if(emaTarget.direction === "above" && currentPrice >= ema){
                if(alert.targetPrice && alert.direction){
                    notif.message = notif.coinName + " has gone " + alert.direction +
                                " to the target price of " + alert.targetPrice +
                                " and is above the " + emaTarget.emaRange + 
                                " EMA on " + emaTarget.time + " timeframe.";
                }else{
                    notif.message = notif.coinName + " price has gone above the " + emaTarget.emaRange + 
                                " EMA on " + emaTarget.time + " timeframe.";
                }

                await notification.addNotification(notif);
                await updateOrRemoveAlert(alert._id, emaTarget._id);
            }else if(emaTarget.direction === "below" && currentPrice <= ema){
                if(alert.targetPrice && alert.direction){
                    notif.message = notif.coinName + " has gone " + alert.direction +
                                " to the target price of " + alert.targetPrice +
                                " and is below the " + emaTarget.emaRange + 
                                " EMA on " + emaTarget.time + " timeframe.";
                }else{
                    notif.message = notif.coinName + " price has gone below the " + emaTarget.emaRange + 
                                " EMA on " + emaTarget.time + " timeframe.";
                }
                await notification.addNotification(notif);
                await updateOrRemoveAlert(alert._id, emaTarget._id);
            }
        }
    }
}

const temaAlertCheck = async (coinsCurrentPrices) => {
    await temaCheckIfTargetPriceHit(coinsCurrentPrices);
    await temaCalculateEmaForAlerts(coinsCurrentPrices);

    const alerts = await EmaTargetAlert.find({});
    return alerts;
}

module.exports = temaAlertCheck;