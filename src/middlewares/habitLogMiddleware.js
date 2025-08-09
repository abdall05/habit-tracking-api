exports.cleanLogData = (req, res, next) => {
  req.body = req.body.value !== undefined ? { value: req.body.value } : {};
  next();
};
