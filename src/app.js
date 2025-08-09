const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const v1Router = require("./v1");
const errorHandler = require("./middlewares/errorHandler");
app.use(bodyParser.json());

app.use("/api/v1", v1Router);

app.use(errorHandler); //global error handler middleware
module.exports = app;
