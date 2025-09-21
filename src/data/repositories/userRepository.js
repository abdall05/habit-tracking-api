const AppError = require("../../utils/AppError");
const HabitLog = require("../models/habitLog");
const User = require("./../models/user");
const mongoose = require("mongoose");
const applySensitiveFieldsSelection = function (query, sensitiveFields) {
  if (Array.isArray(sensitiveFields) && sensitiveFields.length > 0) {
    // Build select string: ' +password +otherField'
    const selectStr = sensitiveFields.map((field) => `+${field}`).join(" ");
    query = query.select(selectStr);
  }
  return query;
};

const sanitizeHabit = (habit) => {
  if (!habit) return;
  habit.id = habit._id.toString();
  delete habit._id;
  delete habit.__v;
  if (habit.latestLog) {
    habit.latestLog.id = habit.latestLog._id.toString();
    delete habit.latestLog._id;
    delete habit.latestLog.__v;
    delete habit.latestLog.createdAt;
  }
};
const sanitizeUser = (user) => {
  if (!user) return;
  user.id = user._id.toString();
  delete user._id;
  delete user.__v;
  for (const habit of user.habits) {
    sanitizeHabit(habit);
  }
};
exports.createUser = async function (userData) {
  const createdDoc = await User.create(userData);
  return {
    id: createdDoc._id,
    name: createdDoc.name,
    email: createdDoc.email,
    timezone: createdDoc.timezone,
  };
};
exports.getUserById = async function (id, sensitiveFields = []) {
  let query = User.findById(id).populate("habits.latestLog");
  query = applySensitiveFieldsSelection(query, sensitiveFields);
  const user = await query.lean();
  sanitizeUser(user);
  return user;
};

exports.getUserByEmail = async function (email, sensitiveFields = []) {
  let query = User.findOne({ email }).populate("habits.latestLog");
  query = applySensitiveFieldsSelection(query, sensitiveFields);
  const user = await query.lean();
  sanitizeUser(user);
  return user;
};

exports.unsetResetToken = async function (id) {
  await User.findByIdAndUpdate(id, {
    $unset: {
      passwordResetToken: 1,
      passwordResetExpires: 1,
    },
  });
};
exports.setResetToken = async function (id, resetTokenFields) {
  await User.findByIdAndUpdate(id, resetTokenFields);
};

exports.updateName = async function (id, newName) {
  await User.findByIdAndUpdate(id, { name: newName });
};
exports.updatePassword = async function (id, newPasswordData) {
  await User.findByIdAndUpdate(id, newPasswordData);
};

exports.createHabit = async function (userId, habitData) {
  const habitId = new mongoose.Types.ObjectId();
  habitData._id = habitId;
  // Use $push to add habit atomically and run validators
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $push: { habits: habitData } },
    { new: true, runValidators: true }
  );

  const createdHabit = updatedUser.habits.id(habitId).toObject();

  return createdHabit;
};

exports.updateHabitLatestLog = async function (userId, habitId, latestLogId) {
  await User.updateOne(
    { _id: userId, "habits._id": habitId },
    { $set: { "habits.$.latestLog": latestLogId } }
  );
};
exports.deleteHabit = async function (userId, habitId, session = null) {
  const options = session ? { session } : {};
  await User.findByIdAndUpdate(
    userId,
    { $pull: { habits: { _id: habitId } } },
    options
  );
};

exports.updateHabit = async function (userId, habitId, updateData) {
  const setFields = {};
  for (const [key, value] of Object.entries(updateData)) {
    setFields[`habits.$.${key}`] = value;
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, "habits._id": habitId },
    { $set: setFields },
    { new: true, runValidators: true }
  ).populate("habits.latestLog");

  if (!updatedUser) {
    throw new AppError("User or habit not found", 404);
  }

  const updatedHabit = updatedUser.habits.id(habitId);
  if (!updatedHabit) {
    throw new AppError("Habit not found after update", 404);
  }

  sanitizeHabit(updatedHabit);
  return updatedHabit;
};
