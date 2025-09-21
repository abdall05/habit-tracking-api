const { DateTime } = require("luxon");

exports.getLocalMidnightDate = function (timezone) {
  // Get now in timezone
  const nowInUserTZ = DateTime.now().setZone(timezone);

  // Set time to midnight (start of day) in  timezone
  const midnightInUserTZ = nowInUserTZ.startOf("day");

  // Convert to JS Date object in UTC (for MongoDB)
  return midnightInUserTZ.toJSDate();
};

exports.formatLocalDateString = function (dateUTC, timezone) {
  return DateTime.fromJSDate(dateUTC, { zone: timezone }).toFormat(
    "yyyy-MM-dd"
  );
};

exports.getDateRangeForMonth = function (userTimezone, monthOffset = 0) {
  const now = DateTime.now().setZone(userTimezone);

  // Start of requested month
  const startOfMonth = now.plus({ months: monthOffset }).startOf("month");

  // End of requested month
  const endOfMonth =
    monthOffset === 0
      ? now.startOf("day") // current month → up to today
      : startOfMonth.endOf("month"); // previous/future month → end of month

  return {
    from: startOfMonth.toJSDate(),
    to: endOfMonth.toJSDate(),
  };
};
