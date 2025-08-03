const express = require("express");

const router = new express.Router();

router.route("/").get((req, res, next) => {
  res.status(200).send("V1 router");
});

module.exports = router;
