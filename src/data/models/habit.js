const mongoose = require("mongoose");
const applyCleanTransform = require("./../../utils/mongooseTransform");
const AppError = require("./../../utils/AppError");

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    // unique: true, // this has no effect when embedding the document
  },
  description: String,
  createdAt: {
    type: Date,
    required: true,
  },
  latestLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HabitLog",
    default: null,
  },
  type: {
    type: String,
    enum: ["boolean", "numeric"],
    required: true,
  },

  unit: {
    type: String,
    required: [
      function () {
        return this.type === "numeric";
      },
      "Unit is required when type is numeric",
    ],
  },

  min: {
    type: Number,
    required: [
      function () {
        return this.type === "numeric";
      },
      "Min is required when type is numeric",
    ],
  },

  target: {
    type: Number,
    required: [
      function () {
        return this.type === "numeric";
      },
      "Target is required when type is numeric",
    ],
  },

  best: {
    type: Number,
    required: [
      function () {
        return this.type === "numeric";
      },
      "Best is required when type is numeric",
    ],
  },
});

applyCleanTransform(habitSchema);

habitSchema.pre("validate", function (next) {
  if (this.type === "numeric") {
    // If any required fields missing, skip here and let required validators handle
    if (this.min == null || this.target == null || this.best == null) {
      return next(); // just proceed; required validators will catch missing fields
    }

    // Now check the logical condition
    if (!(this.min < this.target && this.target < this.best)) {
      return next(new AppError("min < target < best required", 400));
    }

    // Also check if all are positive
    if (this.min <= 0 || this.target <= 0 || this.best <= 0) {
      return next(
        new AppError("min, target, best must be positive numbers", 400)
      );
    }
  }
  next();
});

module.exports = habitSchema;
