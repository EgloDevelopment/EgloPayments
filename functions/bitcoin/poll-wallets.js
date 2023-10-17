const axios = require("axios");

const { get } = require("../../mongodb");
const { getBalance, deposit } = require("../../functions/bitcoin/wallet");

async function pollWallets() {
  console.log(`Running wallet checks at ${Date.now()}`);

  const client = get();

  const wallets = await client
    .db("EgloPayments")
    .collection("Transactions")
    .find()
    .toArray();

  for (const wallet of wallets) {
    try {
      if (wallet.time_created + 30 * 60 * 1000 < Date.now()) {

        console.log(
          `Wallet ${wallet.wallet_address} was created over 30 minutes ago`
        );

        let wallet_balance = await getBalance(wallet.wallet_address);

        console.log(`Wallet ${wallet.wallet_address} has ${wallet_balance}BTC`);

        if (wallet_balance >= wallet.amount_btc) {
          
          console.log(`Wallet ${wallet.wallet_address} has been paid`);

          await client.db("EgloPayments").collection("Payments").insertOne({
            id: wallet.id,
            time: Date.now(),
            amount_btc: wallet.amount_btc,
            amount_paid_btc: wallet_balance,
            wallet_address: wallet.wallet_address,
            wallet_private_key: wallet.wallet_private_key,
          });

          await client.db("EgloPayments").collection("Transactions").deleteOne({
            wallet_address: wallet.wallet_address,
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
        }
      }
    } catch {
      console.log(
        `Failed to check ${wallet.wallet_address}, API limits were most likely reached`
      );
    }
  }
}

module.exports = { pollWallets };
