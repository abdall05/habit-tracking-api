module.exports = function removeFields(obj, fields) {
  for (const field of fields) {
    delete obj[field];
  }
};
