//express app
const express = require("express");
const router = express.Router();

//Check Route
router.get("/", function (req, res) {
  res.send("Hello from Wedsy Server. The Server is live!!");
});

//Importing other routes
router.use("/auth", require("./auth"));
router.use("/user", require("./user"));
router.use("/enquiry", require("./enquiry"));
router.use("/decor", require("./decor"));
router.use("/event", require("./event"));
router.use("/payment", require("./payment"));
router.use("/file", require("./file"));
router.use("/quotation", require("./quotation"));

module.exports = router;
