const AppError = require("../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const authService = require("./../v1/services/authService");
const validator = require("validator");
const catchSync = require("./../utils/catchSync");

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

const validateEmail = (email) => {
  if (!email) throw new AppError("Email is required!", 400);

  email = email.toLowerCase().trim();
  if (!validator.isEmail(email)) throw new AppError("Invalid email!", 400);
  return email;
};
function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    throw new AppError("Password and confirmPassword are not matching!", 400);
  }
}
exports.protect = catchAsync(async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    throw new AppError("Token is required!", 401);
  }
  const user = await authService.verifyTokenAndGetUser(token);
  req.user = user;
  next();
});

exports.validateResetPasswordInput = catchSync((req, res, next) => {
  let { email, password, confirmPassword } = req.body;
  email = validateEmail(email);
  if (!email || !password || !confirmPassword) {
    throw new AppError("Missing required field!", 400);
  }

  validatePasswordMatch(password, confirmPassword);

  req.body = { email, password };

  next();
});

exports.validateSigninInput = (req, res, next) => {
  let { email, password } = req.body;
  email = validateEmail(email);
  if (!email || !password)
    throw new AppError("Email and Password are required!", 400);
  req.body = { email, password };
  next();
};

exports.validateSignupInput = (req, res, next) => {
  let { email, password, confirmPassword, name, timezone } = req.body;

  email = validateEmail(email);

  if (!email || !password || !confirmPassword || !name || !timezone)
    throw new AppError("Missing required field!", 400);
  validatePasswordMatch(password, confirmPassword);
  req.body = { email, password, name, timezone };
  next();
};

exports.validateForgetPasswordInput = (req, res, next) => {
  let { email } = req.body;
  email = validateEmail;
  req.body = { email };
  next();
};
