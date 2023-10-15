const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const axios = require("axios");
const { getBalance } = require("../../functions/bitcoin/wallet");

router.get("/", async (req, res) => {
  try {
    let balance = await getBalance(req.query.wallet);
    let usd_balance

    if (balance > 0) {
      await axios
        .get("https://api.coinconvert.net/convert/btc/usd?amount=" + balance)
        .then((response) => {
          usd_balance = parseFloat(response.data.USD.toFixed(2));
        });
    } else {
      usd_balance = 0;
    }

    const client = get();

    const wallet = await client
      .db("EgloPayments")
      .collection("Transactions")
      .findOne({
        wallet_address: req.query.wallet,
      });

    res.status(200).send({
      payment_id: wallet.id,
      confirmed_balance_btc: balance,
      confirmed_balance_usd: usd_balance,
      amount_requested_btc: wallet.amount_btc,
      amount_requested_usd: wallet.amount_usd,
      time_created: wallet.time_created,
      time_expires: wallet.time_expires,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: "Internal server error",
    });
  }
});

module.exports = router;
