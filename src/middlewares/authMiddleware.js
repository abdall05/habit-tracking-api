const AppError = require("../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const authService = require("./../v1/services/authService");

const getToken = (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  return token;
};

exports.protect = catchAsync(async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    throw new AppError("Token is required!");
  }
  const user = await authService.verifyTokenAndGetUser(token);
  req.user = user;
  next();
});
