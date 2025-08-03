const catchAsync = require("./../../utils/catchAsync");
const authService = require("./../services/authService");

exports.signup = catchAsync(async (req, res, next) => {
  const userData = { ...req.body };
  const createdUser = await authService.signup(userData);
});

exports.signin = catchAsync(async (req, res, next) => {});
