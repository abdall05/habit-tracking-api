const userRepository = require("./../../data/repositories/userRepository");
const habitLogRepository = require("./../../data/repositories/habitLogRepository");
const { withTransaction } = require("./../../data/database/transactionHelper");
const AppError = require("./../../utils/AppError");
const {
  getLocalMidnightDate,
  formatLocalDateString,
} = require("./../../utils/localDate");

const habitLogService = require("./habitLogService");
exports.createHabit = async function (user, habitData) {
  const { id, timezone: userTimezone } = user;
  console.log(user);
  const userLocalDateInUtc = getLocalMidnightDate(userTimezone);
  habitData.createdAt = userLocalDateInUtc;
  const createdHabit = await userRepository.createHabit(id, habitData);
  createdHabit.createdAt = formatLocalDateString(
    createdHabit.createdAt,
    userTimezone
  );
  return createdHabit;
};
const formatUserHabits = function (user) {
  for (const habit of user.habits) {
    habitLogService.formatLog(habit.latestLog, user.timezone);
    habit.createdAt = formatLocalDateString(habit.createdAt, user.timezone);
  }
};

exports.getHabits = function (user) {
  console.log(user);
  formatUserHabits(user);
  const { habits } = user;
  return habits;
};
exports.verifyHabitOwnership = async function (user, habitId) {
  const habit = user.habits.find((h) => h.id === habitId);
  if (!habit) {
    throw new AppError("Habit not found", 404);
  }
  return habit;
};

exports.deleteHabit = async function (userId, habitId) {
  try {
    return await withTransaction(async (session) => {
      await userRepository.deleteHabit(userId, habitId, session);
      await habitLogRepository.deleteLogsByHabitId(habitId, session);
    });
  } catch (error) {
    console.log(error);
    throw new AppError("Could not delete habit", 500);
  }
};

exports.formatUserHabits = formatUserHabits;
