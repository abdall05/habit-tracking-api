const catchAsync = require("../../utils/catchAsync");
const habitLogService = require("./../services/habitLogService");

exports.createLog = catchAsync(async (req, res, next) => {
  const { habitId } = req.params;
  const logData = req.body;
  console.log(logData);
  const createdLog = await habitLogService.createLog(
    req.user,
    habitId,
    logData
  );
  res.status(201).json({
    status: "OK",
    data: createdLog,
  });
});

exports.getLogsByHabitId = catchAsync(async (req, res, next) => {
  const { habitId } = req.params;
  const { user } = req;
  let { monthOffset } = req.query;
  monthOffset = monthOffset ? +monthOffset : 0;
  const { habit, logs } = await habitLogService.getLogsByHabitId(
    user,
    habitId,
    monthOffset
  );
  res.status(200).json({
    status: "OK",
    data: { habit, logs },
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
