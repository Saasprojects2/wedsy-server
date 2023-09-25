//express app
const express = require("express");
const router = express.Router();

//Check Route
router.get("/", function (req, res) {
  res.send("Hello from Wedsy Server. The Server is live!!");
});

//Importing other routes
router.use("/decor", require("./decor"));

module.exports = router;
