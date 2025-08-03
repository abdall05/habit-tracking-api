const mongoose = require("mongoose");

class DB {
  constructor() {
    this.isConnected = false;
  }
  async connect() {
    if (this.isConnected) return;
    try {
      await mongoose.connect(process.env.DATABASE);
      this.isConnected = true;
      console.log("Connected to database successfully!");
    } catch (err) {
      console.log(err);
      throw new Error("Error while connecting to database!");
    }
  }
  async close() {
    if (!this.isConnected) return;
    await mongoose.connection.close();
    console.log("Disconnected from database successfully!");
    this.isConnected = false;
  }
}

module.exports = new DB();
