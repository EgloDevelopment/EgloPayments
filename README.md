# EgloPayments
### _Dead simple Bitcoin/Cryptocurrency payments_

Simple and easy to use cryptocurrency payment system

## Features

- Ability to send received funds to your wallet on every purchase
- Every customer gets their own wallet
- Simple to setup and use
- Bitcoin (and more cryptocurrencies coming soon)
- Completely anonymous, no data is saved about where the money came from (on the server, the blockchain saves it)

> The documentation is subject to change at any time,
>EGLO IS NOT RESPONSIBLE FOR ANY LOSS OF MONEY/ASSETS AND DOES NOT HOLD LIABILITY FOR ANYTHING

# How to use
### Requirements

>Node.js

>NPM

>A MongoDB instance/cluster

>A Bitcoin wallet

### Setup
Run **git clone https://github.com/EgloDevelopment/EgloPayments.git** to get the Docker image, and to download the source
Then copy the enviroment variables from **example.env** into **.env** in the main directory of EgloPayments
(Or if you are using Portainer copy these values and set them in container setup)

```
UTXO_API = "https://api.blockcypher.com/v1/btc/main/addrs/"
MONGODB_URL = "mongodb://your-mongodb-url"
DISCORD_WEBHOOK_URL = "your-discord-webhook-url"
BITCOIN_DEPOSIT_WALLET_ADDRESS = "main-bitcoin-wallet-address-to-deposit-to"
BITCOIN_FEE = "1000"
MINUTES_UNTIL_PAYMENT_EXPIRES = "60"
```

Then run **npm install** in the main directory of EgloPayments
After install is finished, type **npm run prod** and press *Enter*
The server should now be available on port **5000**

# Routes

### [POST] Create payment (http://your-server-ip:5000/bitcoin/create-payment)

Request body to be sent:
```
{
    "amount": (float/integer, USD amount to be charged),
    "webhook_to_post_to": (string, Webhook to make a POST request to when amount is paid)
}
```
This route returns this body:
```
{
  "payment_id": (string, Randomly generated ID for the payment),
  "wallet_address": (string, Address of Bitcoin wallet to send the money to),
  "amount_usd": (float/integer, Amount of USD that will be charged),
  "amount_btc": (float, Amount of Bitcoin that needs to be sent)
}
```

### [GET] Get wallet balance (http://your-server-ip:5000/bitcoin/get-wallet-balance?wallet=your-wallet-id)

Request body to be sent:
```
{
    N/A, wallet is passed in the URL
}
```
This route returns this body:
```
{
  "payment_id": (string, Generated string that matches the wallet ID and payment ID),
  "confirmed_balance_btc": (float, Confirmed Bitcoin balance of wallet),
  "confirmed_balance_usd": (float, Confirmed USD value of wallet),
  "amount_requested_btc": (float, Bitcoin amount of how much Bitcoin the wallet is expecting),
  "amount_requested_usd": (float/integer, USD amount of how much bitcoin the wallet is expecting),
  "time_created": (integer, Time in UNIX when the payment was created),
  "time_expires": (integer, Time in Unix when the payment expires)
}
```

### [GET] Poll wallet (http://your-server-ip:5000/bitcoin/poll-wallet?wallet=your-wallet-id)

Request body to be sent:
```
{
    N/A, wallet is passed in the URL
}
```
This route returns this body:
```
{
  "response": (string, States wether the payment is pending, expired, or completed),
  "current_amount": (float/integer, States how much Bitcoin is currently in the wallet),
  "btc_needed": (float/integern Returns how much more Bitcoin is needed to complete the transaction)
}
```

# Notes
ONLY USE THE Poll wallet ROUTE TO CHECK IF THE CUSTOMER HAS PAID, NOT THE Get wallet balance ROUTE OR ELSE WITHDRAWS AND TIME EXPIRY WILL NOT WORK

This has yet to be used in a production enviroment lol, but I have tested it with fake Bitcoin and real Bitcoin and it worked flawlessly.

The provider for the wallet data (blockcypher.com) is not too friendly about API requests and you can make only 100 per hour, (basically 100 wallet polls and wallet balance checks every hour).

For the Bitcoin to show up in the wallet it needs to have over 3 confirmations in the Blockchain, which can take up to 30 minutes sometimes (really depends on your fee amount and how much you sent and which nodes and stuff), so I would recommend just checking every 5-10 minutes, or making the customer click a button to check, (with a cooldown so blockcypher.com doesn't get mad).

THIS IS NOT MEANT TO BE EXPOSED TO THE PUBLIC, RUN THIS BEHIND A FIREWALL OR PROXY AND ONLY USE IT ON YOUR BACKEND SERVER, AND IF YOU NEED TO, PROXY THE POLL REQUESTS THROUGH THE BACKEND SERVER


