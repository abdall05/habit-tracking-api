const userRepository = require("./../../data/repositories/userRepository");
const habitLogRepository = require("./../../data/repositories/habitLogRepository");
const { withTransaction } = require("./../../data/database/transactionHelper");
const AppError = require("./../../utils/AppError");
const {
  getLocalMidnightDate,
  formatLocalDateString,
} = require("./../../utils/localDate");
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

exports.getHabits = function (user) {
  const { timezone: userTimezone, habits } = user;
  for (const habit of habits) {
    habit.createdAt = formatLocalDateString(habit.createdAt, userTimezone);
  }
  return habits;
};

exports.deleteHabit = async function (userId, habitId) {
  try {
    return await withTransaction(async (session) => {
      await userRepository.deleteHabit(userId, habitId, session);
      await habitLogRepository.deleteLogByHabitId(habitId, session);
    });
  } catch (error) {
    console.log(error);
    throw new AppError("Could not delete habit", 500);
  }
};
