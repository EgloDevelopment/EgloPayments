const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const axios = require("axios");
const { getBalance, deposit } = require("../../functions/bitcoin/wallet");

router.get("/", async (req, res) => {
  try {
    let wallet_balance = await getBalance(req.query.wallet);

    let response

    const client = get();

    const wallet = await client
      .db("EgloPayments")
      .collection("Transactions")
      .findOne({
        wallet_address: req.query.wallet,
      });

    if (wallet_balance >= wallet.amount_btc) {
      response = "completed";

      await client.db("EgloPayments").collection("Payments").insertOne({
        id: wallet.id,
        time: Date.now(),
        amount_btc: wallet.amount_btc,
        amount_paid_btc: wallet_balance,
        wallet_address: wallet.wallet_address,
        wallet_private_key: wallet.wallet_private_key,
      });

      await client.db("EgloPayments").collection("Transactions").deleteOne({
        wallet_address: req.query.wallet,
      });

      try {
        await axios.post(wallet.webhook_to_post_to);
      } catch (e) {
        console.log(e);
        console.log("Failed to post to webhook");
      }

      try {
        deposit(wallet.wallet_address, wallet.wallet_private_key);
      } catch (e) {
        console.log(e);
        console.log(
          "Failed to deposit, the wallets private and public key are still saved in Payments inside MongoDB"
        );
      }
    } else {
      response = "pending"
    }

    res.status(200).send({
      response: response,
      current_amount: wallet_balance,
      btc_needed: wallet.amount_btc - wallet_balance,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: "Wallet not found",
    });
  }
});

module.exports = router;
