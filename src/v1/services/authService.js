const AppError = require("./../../utils/AppError");
const userRepository = require("./../../data/repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("./../../utils/email");
const removeFields = require("./../../utils/removeFields");
const userService = require("./userService");

const { SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN, RESET_TOKEN_EXPIRES_IN } =
  process.env;
const resetTokenExpiresInMs =
  parseInt(process.env.RESET_TOKEN_EXPIRES_IN, 10) * 60 * 1000;

const generateJwtToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const generateResetToken = () => crypto.randomBytes(32).toString("hex");
const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Token has expired!. Please log in again.", 401);
    } else {
      throw new AppError("Invalid token. Please log in again.", 401);
    }
  }
};

async function hashPassword(password) {
  const hashed = await bcrypt.hash(password, +SALT_ROUNDS);
  return hashed;
}

exports.signup = async function (userData) {
  userData.password = await hashPassword(userData.password);
  const createdUser = await userRepository.createUser(userData);
  const token = generateJwtToken(createdUser.id);
  return { token, user: createdUser }; //filter user
};

exports.login = async function (userData) {
  const { email, password } = userData;
  const sensitiveFields = ["password"];
  const user = await userRepository.getUserByEmail(email, sensitiveFields);
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new AppError("Incorrect email or password!", 401);
  const token = generateJwtToken(user.id);
  removeFields(user, sensitiveFields);
  return { token, user }; // filter user
};

exports.verifyTokenAndGetUser = async function (token) {
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new AppError("Invalid or expired token.", 401);
  }
  const userId = decoded.id;
  const sensitiveFields = ["passwordChangedAt"];

  const user = await userRepository.getUserById(userId, sensitiveFields);
  if (!user) throw new AppError("Invalid or expired token.", 401);
  if (
    user.passwordChangedAt &&
    Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
  ) {
    throw new AppError("Token has expired!. Please log in again.", 401);
  }
  removeFields(user, sensitiveFields);

  //format user (habits (latesLog))
  // userService.formatUserHabits(user);

  return user;
};

exports.forgetPassword = async function (email, baseURL) {
  const user = await userRepository.getUserByEmail(email);
  if (!user) throw new AppError("No user with that email!", 404);
  const userId = user.id;
  const resetToken = generateResetToken();
  const passwordResetToken = hashResetToken(resetToken);
  const passwordResetExpires = Date.now() + resetTokenExpiresInMs;
  await userRepository.setResetToken(userId, {
    passwordResetToken,
    passwordResetExpires,
  });
  const resetURL = `${baseURL}/api/v1/resetPassword/${resetToken}`;
  const text = `Forgot you password? Submit a PATCH request with the new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email,
      subject: `Your password reset token (valid for ${RESET_TOKEN_EXPIRES_IN} min)`,
      text,
    });
  } catch (err) {
    await userRepository.unsetResetToken(user.id);
    throw new AppError(
      "There was an error sending the email. Try again later!",
      500
    );
  }
};

exports.resetPassword = async function (email, password, resetToken) {
  const sensitiveFields = ["passwordResetToken", "passwordResetExpires"];
  const user = await userRepository.getUserByEmail(email, sensitiveFields);
  if (!user) throw new AppError("No user found with that email!", 404);
  const { passwordResetToken, passwordResetExpires, id } = user;
  const hashedResetToken = hashResetToken(resetToken);
  if (hashedResetToken !== passwordResetToken)
    throw new AppError("Invalid reset token!", 400);
  if (passwordResetExpires < Date.now()) {
    throw new AppError("Password reset token has expired", 400);
  }
  const hashedPassword = await hashPassword(password);
  try {
    await userRepository.updatePassword(id, {
      password: hashedPassword,
      passwordChangedAt: Date.now() - 1000,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  } catch (err) {
    console.error("Password update error:", err);
    throw new AppError(
      "Failed to update the password! Please try again later!",
      500
    );
  }
  const new_jwt_token = generateJwtToken(id);
  return new_jwt_token;
};
