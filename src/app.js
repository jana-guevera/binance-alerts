const path = require("path");
const express = require("express");

require("./db/mongoose.js");

const basicAlertRouter = require("./routers/basic_alerts_router.js");
const emaTargetAlertRouter = require("./routers/ema-target-alert-router.js");
const notificationRouter = require("./routers/notification-router.js");

const app = express();

const staticFilePath = path.join(__dirname, "../public");
app.use(express.static(staticFilePath));
app.use(express.json()); 

app.use(basicAlertRouter);
app.use(emaTargetAlertRouter);
app.use(notificationRouter);

app.listen(process.env.PORT);