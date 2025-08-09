const mongoose = require("mongoose");
const applyCleanTransform = require("./../../utils/mongooseTransform");

const habitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  localDate: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    validate: {
      validator: (val) => val >= 0,
      message: "Value must be greater than or equal to 0",
    },
  },
  min: Number,
  target: Number,
  best: Number,
});

habitLogSchema.index({ habitId: 1, localDate: 1 }, { unique: true });

applyCleanTransform(habitLogSchema);

const HabitLog = mongoose.model("HabitLog", habitLogSchema);

module.exports = HabitLog;
