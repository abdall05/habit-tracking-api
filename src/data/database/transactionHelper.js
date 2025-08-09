const mongoose = require("mongoose");

async function withTransaction(fn) {
  const session = await mongoose.startSession();
  let result;

  try {
    result = await session.withTransaction(async () => {
      return await fn(session);
    });
  } finally {
    session.endSession();
  }

  return result;
}

module.exports = { withTransaction };
