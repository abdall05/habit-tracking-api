const AppError = require("../utils/AppError");

exports.habitDataCleaner = function (req, res, next) {
  const { type, unit, min, target, best, title, description } = req.body;

  if (!type) return next(new AppError("Habit type is required!", 400));

  let cleanedBody;

  if (type === "boolean") {
    cleanedBody = { title, type, description };
  } else if (type === "numeric") {
    cleanedBody = { title, description, type, unit, min, target, best };
  } else {
    return next(
      new AppError("The habit type must be either 'boolean' or 'numeric'.", 400)
    );
  }

  req.body = cleanedBody;
  next();
};

exports.habitUpdateDataCleaner = function (req, res, next) {
  const { min, target, best, title, description } = req.body;

  const cleanedBody = { min, target, best, title, description };

  req.body = cleanedBody;
  next();
};
