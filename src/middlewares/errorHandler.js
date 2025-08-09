const { handleDbError } = require("./../data/database/handleDbErrors");

module.exports = (err, req, res, next) => {
  console.error(err);

  err = handleDbError(err);
  const status = err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
};
