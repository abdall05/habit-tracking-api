const catchAsync = require("../../utils/catchAsync");
const habitLogService = require("./../services/habitLogService");
const userService = require("./../services/userService");

exports.createLog = catchAsync(async (req, res, next) => {
  const { habitId } = req.params;
  const { user } = req;
  const logData = req.body;
  const habit = await userService.verifyHabitOwnership(user, habitId);
  const createdLog = await habitLogService.createLog(user, habit, logData);
  res.status(201).json({
    status: "OK",
    data: createdLog,
  });
});

exports.getLogsByHabitId = catchAsync(async (req, res, next) => {
  const { habitId } = req.params;
  const { user } = req;
  let { monthOffset } = req.query;
  monthOffset = monthOffset ? parseInt(monthOffset, 10) : 0;
  if (isNaN(monthOffset) || monthOffset > 0) {
    monthOffset = 0;
  }
  const habit = await userService.verifyHabitOwnership(user, habitId);
  let { from, to, logs } = await habitLogService.getHabitLogs(
    user,
    habit,
    monthOffset
  );
  userService.formatHabit(habit);
  res.status(200).json({
    status: "OK",
    data: { habit, from, to, logs },
  });
});

exports.updateLogById = catchAsync(async (req, res, next) => {
  const { habitId, logId } = req.params;
  const { user } = req;
  const { value } = req.body;
  const newLogData = { value };
  const updatedLog = await habitLogService.updateLogById(
    user,
    habitId,
    logId,
    newLogData
  );
  res.status(200).json({
    status: "OK",
    data: updatedLog,
  });
});
