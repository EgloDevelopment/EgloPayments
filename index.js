const express = require("express");
const app = express();
const cron = require("node-cron");

const { pollWallets } = require("./functions/bitcoin/poll-wallets");

require("dotenv").config();

const mongodb_init = require(__dirname + "/mongodb");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const magic = require("express-routemagic");
const mongoSanitize = require("express-mongo-sanitize");

app.use(mongoSanitize());
app.use(bodyParser.json({ limit: "5gb" }));
app.use(bodyParser.urlencoded({ limit: "5gb", extended: true }));
app.use(cookieParser());

magic.use(app);

mongodb_init();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.listen(5000, () => {
  console.log(`EgloPayments listening on port 5000`);
});

cron.schedule("*/1 * * * *", () => {
  pollWallets();
});
