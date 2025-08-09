const mongoose = require("mongoose");

const validator = require("validator");

const habitSchema = require("./habit");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email address",
    },
  },
  timezone: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return Intl.supportedValuesOf("timeZone").includes(value);
      },
      message: (props) => `${props.value} is not a valid IANA timezone.`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  habits: {
    type: [habitSchema],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
