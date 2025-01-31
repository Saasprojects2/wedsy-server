const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cron = require("node-cron");
require("dotenv").config();
const { EventCompletionChecker } = require("./utils/jobs");

//Creating Express App
const app = express();

//Applying middlewares
// app.use(cors());
app.use(cors({ origin: "*" })); //Temporary Change
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

//Connecting Database
const dbUrl = process.env.DATABASE_URL;
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const database = mongoose.connection;
database.on("error", (error) => {
  console.log(error);
});
database.once("connected", () => {
  console.log("--Database Connected");
});

//Adding routers
app.use("/", require("./routes/router"));

//Setting up the Ports and starting the app
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function () {
  console.log(`--App listening on port ${port}`);
  // EventCompletionChecker();
  // Corn Jobs
  cron.schedule("0 10 * * *", () => {
    console.log(
      "This function will run at 10 AM every day according to the local timezone"
    );
    EventCompletionChecker();
  });
});
