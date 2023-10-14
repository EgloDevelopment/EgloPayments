require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const mongoDbUrl = process.env.MONGODB_URL;

let client;

module.exports = async () => {
  try {
    client = await MongoClient.connect(mongoDbUrl);
    console.log("Connected to MongoDB");
  } catch (e) {
    console.log("Could not connect to MongoDB");
  }
};

module.exports.get = () => client;

module.exports.close = () => client.close();