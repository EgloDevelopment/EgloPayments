const express = require("express");
const router = express.Router();

require("dotenv").config();

router.post("/", (req, res) => {
  console.log(req.body);
  res.status(200).send({ received: true });
});

module.exports = router;
