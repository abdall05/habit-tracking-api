const AppError = require("./../../utils/AppError");

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDb = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field: {${field}: ${value}}`;
  return new AppError(message, 409);
};
const handleValidatorsDb = (err) => {
  const message = Object.values(err.errors)
    .map((error) => {
      return `${error.message}:{${error.path}:${error.value}}`;
    })
    .join(". ");
  return new AppError(`Invalid input data: ${message}`, 400);
};

exports.handleDbError = function (error) {
  if (error.name === "CastError") {
    error = handleCastErrorDb(error);
  }
  if (error.code === 11000) {
    error = handleDuplicateFieldDb(error);
  }
  if (error.name === "ValidationError") {
    error = handleValidatorsDb(error);
  }
  return error;
};
