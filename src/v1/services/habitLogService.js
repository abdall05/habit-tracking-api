const userRepository = require("./../../data/repositories/userRepository");
const habitLogRepository = require("./../../data/repositories/habitLogRepository");
const { withTransaction } = require("./../../data/database/transactionHelper");

const {
  getLocalMidnightDate,
  formatLocalDateString,
  getDateRangeForMonth,
} = require("./../../utils/localDate");

const formatLog = function (log, userTimezone) {
  log.localDate = formatLocalDateString(log.localDate, userTimezone);
};

const formatLogs = function (logs, userTimezone) {
  for (const log of logs) {
    formatLog(log, userTimezone);
  }
};
const AppError = require("../../utils/AppError");
exports.createLog = async function (user, habit, logData) {
  if (habit.type === "numeric") {
    if (logData.value === undefined)
      throw new AppError("value is required for numeric habits!", 403);
    logData.min = habit.min;
    logData.target = habit.target;
    logData.best = habit.best;
  } else {
    logData.value = 1; //boolean
  }
  logData.habitId = habit.id;
  const localDate = getLocalMidnightDate(user.timezone);
  logData.localDate = localDate;
  let createdLog;
  try {
    await withTransaction(async (session) => {
      createdLog = await habitLogRepository.createLog(logData, session);
      await userRepository.updateHabitLatestLog(
        user.id,
        habit.id,
        createdLog.id,
        session
      );
    });
  } catch (error) {
    if (habitLogRepository.isDuplicateLogTodayError(error))
      throw new AppError("Habit already logged for this day", 409);
    throw error;
  }
  formatLog(createdLog);
  return createdLog;
};

exports.getHabitLogs = async function (user, habitID, monthOffset) {
  const { timezone: userTimezone } = user;

  const { from, to } = getDateRangeForMonth(userTimezone, monthOffset);

  const logs = await habitLogRepository.getLogsByHabitId(habitID, from, to);
  formatLogs(logs);

  return { logs };
};

exports.updateLogById = async function (user, habitId, logId, newLogData) {
  const { habits, timezone: userTimezone } = user;
  const localDate = getLocalMidnightDate(userTimezone);

  const habit = habits.find((h) => h.id === habitId);
  if (!habit) throw new AppError("Habit not found!", 404);
  if (habit.type === "boolean") {
    if (newLogData.value !== 0 || newLogData.value !== 1) {
      throw new AppError("Value is either 0 or 1 for boolean habits!", 403);
    }
  }
  const log = await habitLogRepository.getLogById(logId);
  if (!log) throw new AppError("No log was found!", 404);

  if (localDate.getTime() !== new Date(log.localDate).getTime()) {
    throw new AppError("Cannot update logs created before today!", 400);
  }

  const updatedLog = await habitLogRepository.updateLogById(logId, newLogData);
  if (!updatedLog) throw new AppError("Failed to update the log!", 500);
  updatedLog.localDate = formatLocalDateString(
    updatedLog.localDate,
    userTimezone
  );
  return updatedLog;
};

exports.formatLog = formatLog;
