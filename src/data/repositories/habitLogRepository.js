const mongoose = require("mongoose");
const HabitLog = require("./../models/habitLog");
const User = require("./../models/user");
const AppError = require("../../utils/AppError");
const removeFields = require("./../../utils/removeFields");

const sanitizeLog = (log) => {
  if (!log) return;
  log.id = log._id.toString();
  delete log._id;
  delete log.__v;
  delete log.createdAt;
  delete log.habitId;
};

exports.createLog = async function (logData, session = null) {
  const options = session ? { session } : {};
  const createdLog = (await HabitLog.create([logData], options))[0].toObject();
  removeFields(createdLog, ["createdAt"]);
  return createdLog;
};

exports.isDuplicateLogTodayError = function (err) {
  return (
    err &&
    err.code === 11000 &&
    err.keyPattern &&
    err.keyPattern.habitId &&
    err.keyPattern.localDate
  );
};

exports.getLogsByHabitId = async function (habitId, from, to) {
  const logs = await HabitLog.find({
    habitId,
    localDate: {
      $gte: from,
      $lte: to,
    },
  })
    .sort({ localDate: -1 })
    .lean();
  for (const log of logs) {
    sanitizeLog(log);
  }
  return logs;
};

exports.getLogById = async function (logId) {
  const log = await HabitLog.findById(logId).lean();
  sanitizeLog(log);
  return log;
};

exports.updateLogById = async function (logId, logData) {
  const newLog = (
    await HabitLog.findByIdAndUpdate(logId, logData, {
      new: true,
      runValidators: true,
    })
  )?.toObject();
  removeFields(newLog, ["createdAt"]);
  return newLog;
};

exports.deleteLogsByHabitId = async function (habitId, session = null) {
  await HabitLog.deleteMany({ habitId }, session);
};
