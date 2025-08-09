const userService = require("./../services/userService");
const catchAsync = require("./../../utils/catchAsync");

exports.createHabit = catchAsync(async (req, res, next) => {
  const habitData = req.body;
  const createdHabit = await userService.createHabit(req.user, habitData);
  res.status(201).json({
    status: "OK",
    data: createdHabit,
  });
});
exports.getHabits = (req, res, next) => {
  const user = req.user;
  const habits = userService.getHabits(user);
  res.status(200).json({
    status: "OK",
    data: habits,
  });
};

exports.deleteHabit = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const habitId = req.params.habitId;
  await userService.deleteHabit(userId, habitId);
  res.status(204).json({
    status: "OK",
  });
});
