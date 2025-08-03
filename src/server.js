const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: `${path.join(__dirname, "..", "config.env")}` });
const { PORT } = process.env;

const app = require("./app");
const DB = require("./data/database/database");

const main = async function () {
  await DB.connect();
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
};
main();
