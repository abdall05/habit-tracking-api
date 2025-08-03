const AppError = require("./../../utils/AppError");
const userRepository = require("./../../data/repositories/userRepository");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { time } = require("console");

const { SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const generateJwtToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

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
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
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
  const user = await userRepository.getUser(email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new AppError("Incorrect email or password!", 401);
  const token = generateJwtToken(user.id);
  return { token, user }; // filter user
};

exports.verifyTokenAndGetUser = async function (token) {
  const decoded = verifyToken(token);
  userId = decoded.id;
  const user = userRepository.getUserById(id);
  if (
    user.passwordChangedAt &&
    Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
  ) {
    throw new AppError("Token has expired!. Please log in again.", 401);
  }
  return user;
};
