const express = require("express");
const app = express();
const v1Router = require("./v1");
const errorHandler = require("./middlewares/errorHandler");

app.use("/api/v1", v1Router);

app.use(errorHandler); //global error handler middleware
module.exports = app;
