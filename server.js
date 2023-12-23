const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

//Creating Express App
const app = express();

//Applying middlewares
app.use(cors());
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
});