const mongoose = require("mongoose");

class DB {
  constructor() {
    this.isConnected = false;
    this.connection_url = process.env.DATABASE.replace(
      "<db_password>",
      process.env.DB_PASSWORD
    );
  }
  async connect() {
    if (this.isConnected) return;
    try {
      await mongoose.connect(this.connection_url);
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
