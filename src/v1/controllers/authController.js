const AppError = require("../../utils/AppError");
const catchAsync = require("./../../utils/catchAsync");
const authService = require("./../services/authService");

exports.signup = catchAsync(async (req, res, next) => {
  const userData = req.body;
  const createdUser = await authService.signup(userData);
  res.status(201).json({
    status: "OK",
    data: createdUser,
  });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError("Email and Password are required!", 401);
  const response = await authService.login({ email, password });
  res.status(200).json({
    status: "OK",
    data: response,
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const baseURL = `${req.protocol}://${req.get("host")}`;
  await authService.forgetPassword(email, baseURL);

  res.status(200).json({
    status: "success",
    message: "Reset token sent to email!",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  const { email, password } = req.body;

  const token = await authService.resetPassword(email, password, resetToken);
  res.status(200).json({
    status: "OK",
    token,
  });
});
