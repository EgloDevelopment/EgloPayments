const { PrivateKey } = require("bitcore-lib");
const CryptoAccount = require("send-crypto");
const { mainnet, testnet } = require("bitcore-lib/lib/networks");

const axios = require("axios");

require("dotenv").config();

const createLegacyWallet = (network) => {
  let privateKey = new PrivateKey();
  let address = privateKey.toAddress(network);

  return {
    privateKey: privateKey.toString(),
    address: address.toString(),
  };
};

const getBalance = async (address) => {
  let satoshis = 0;

  const response = await axios.get(`${process.env.UTXO_API}${address}`);

  if (response.data.txrefs) {
    for (const data of response.data.txrefs) {
      if (
        data.confirmations > 3 &&
        data.value > 0 &&
        data.spent === false &&
        data.double_spend === false
      ) {
        satoshis = satoshis + data.value;
      }
    }
  } else {
    satoshis = 0;
  }

  return satoshis * 0.00000001;
};

const deposit = async (publicKey, privateKey) => {
  const account = new CryptoAccount(privateKey);

  current_balance = await getBalance(publicKey);

  await account.send(
    process.env.BITCOIN_DEPOSIT_WALLET_ADDRESS,
    current_balance,
    "BTC",
    {
      fee: parseInt(process.env.BITCOIN_FEE),
      subtractFee: true,
    }
  );
};

module.exports = {
  createLegacyWallet,
  deposit,
  getBalance,
};
