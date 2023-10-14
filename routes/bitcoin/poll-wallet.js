const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const { sendDiscordNotification } = require("../../functions/other/send-notification")
const { getBalance } = require("../../functions/bitcoin/wallet");

router.get("/", async (req, res) => {
  try {
    let balance = await getBalance(req.query.wallet);

    let response = "pending";

    const client = get();

    const wallet = await client
      .db("EgloPayments")
      .collection("Transactions")
      .findOne({
        wallet_address: req.query.wallet,
      });

    if (wallet.time_expires < Date.now()) {
      response = "expired";
      await client.db("EgloPayments").collection("Transactions").deleteOne({
        wallet_address: req.query.wallet,
      });
    }

    if (balance >= wallet.amount_btc) {
      response = "completed";
      await client.db("EgloPayments").collection("Transactions").deleteOne({
        wallet_address: req.query.wallet,
      });
      await client.db("EgloPayments").collection("Payments").insertOne({
        id: wallet.id,
        time: Date.now(),
        amount_btc: wallet.amount_btc,
      });
      sendDiscordNotification(wallet.amount_btc)
    }

    res.status(200).send({
      response: response,
      current_amount: balance,
      btc_needed: wallet.amount_btc - balance,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: "Wallet not found",
    });
  }
});

module.exports = router;
