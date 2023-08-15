const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
require("./db/mongoose.js");

const binancePrices = require("./logic/binance-price-list.js");
const baCheckCondition = require("./logic/basic-alert-checker.js");
const temaAlertCheck = require("./logic/ema-target-checker.js");
const notificationLogic = require("./logic/notification.js");

const basicAlertRouter = require("./routers/basic_alerts_router.js");
const emaTargetAlertRouter = require("./routers/ema-target-alert-router.js");
const notificationRouter = require("./routers/notification-router.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const staticFilePath = path.join(__dirname, "../public");
app.use(express.static(staticFilePath));
app.use(express.json()); 

app.use(basicAlertRouter);
app.use(emaTargetAlertRouter);
app.use(notificationRouter);

var coinsCurrentPrices = {};
var baAlerts = [];
var temaAlerts = [];
var notifications = [];

const starChecking = async () => {
    try{
        coinsCurrentPrices = await binancePrices();
        baAlerts = await baCheckCondition(coinsCurrentPrices);
        temaAlerts = await temaAlertCheck(coinsCurrentPrices);
        notifications = await notificationLogic.getNotifications();

        io.sockets.emit("data", {
            coinsCurrentPrices:coinsCurrentPrices,
            baAlerts: baAlerts,
            notifications: notifications,
            temaAlerts:temaAlerts
        });
    }catch(e){
        console.log(e);
    }

    setTimeout(() => {
        starChecking();
    }, 5000);
}

starChecking();

server.listen(process.env.PORT);