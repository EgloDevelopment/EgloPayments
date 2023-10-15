const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { mainnet, testnet } = require("bitcore-lib/lib/networks");
const { createLegacyWallet } = require("../../functions/bitcoin/wallet");

router.post("/", async (req, res) => {
  try {
    let wallet_data = createLegacyWallet(mainnet);

    let payment_id = uuidv4();

    await axios
      .get(
        "https://api.coinconvert.net/convert/usd/btc?amount=" + req.body.amount
      )
      .then((response) => {
        amount_btc = response.data.BTC;
      });

    const client = get();

    await client
      .db("EgloPayments")
      .collection("Transactions")
      .insertOne({
        id: payment_id,
        amount_usd: req.body.amount,
        amount_btc: amount_btc,
        wallet_address: wallet_data.address,
        wallet_private_key: wallet_data.privateKey,
        time_created: Date.now(),
        time_expires: Date.now() + parseInt(process.env.MINUTES_UNTIL_PAYMENT_EXPIRES) * 60 * 1000, // 60 mins
        webhook_to_post_to: req.body.webhook_to_post_to,
      });

    res.status(200).send({
      payment_id: payment_id,
      wallet_address: wallet_data.address,
      amount_usd: req.body.amount,
      amount_btc: amount_btc,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: "Internal server error",
    });
  }
});

module.exports = router;
