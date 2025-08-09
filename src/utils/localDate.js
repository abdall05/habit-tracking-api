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

  const startOfMonth = now.plus({ months: monthOffset }).startOf("month");
  const from = startOfMonth.toJSDate(); // UTC Date

  let to;

  if (monthOffset === 0) {
    // To is today's local midnight (start of day)
    to = now.startOf("day").toJSDate();
  } else {
    // To is the first day of the *next* month (exclusive end)
    to = startOfMonth.plus({ months: 1 }).startOf("month").toJSDate();
  }

  return { from, to };
};
