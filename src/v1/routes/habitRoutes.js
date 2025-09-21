const express = require("express");
const habitController = require("./../controllers/habitController");
const habitMiddleware = require("./../../middlewares/habitMiddleware");
const habitLogMiddleware = require("./../../middlewares/habitLogMiddleware");
const habitLogController = require("./../controllers/habitLogController");
const router = express.Router();

router
  .route("/")
  .get(habitController.getHabits)
  .post(habitMiddleware.habitDataCleaner, habitController.createHabit);

router
  .route("/:habitId")
  .delete(habitController.deleteHabit)
  .patch(habitMiddleware.habitUpdateDataCleaner, habitController.updateHabit);
router
  .route("/:habitId/logs")
  .post(habitLogMiddleware.cleanLogData, habitLogController.createLog)
  .get(habitLogController.getLogsByHabitId);
router.route("/:habitId/logs/:logId").patch(habitLogController.updateLogById);

module.exports = router;
