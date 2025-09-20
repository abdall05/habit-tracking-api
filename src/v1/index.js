const express = require("express");
const authMiddleware = require("./../middlewares/authMiddleware");
const habitRouter = require("./routes/habitRoutes");
const authRouter = require("./routes/authRoutes");
const router = new express.Router();

router.use("/auth", authRouter);

router.use("/habits", authMiddleware.protect, habitRouter);

module.exports = router;
