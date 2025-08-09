function cleanDocTransform(doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

function applyCleanTransform(schema) {
  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: cleanDocTransform,
  });
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: cleanDocTransform,
  });
}

module.exports = applyCleanTransform;
