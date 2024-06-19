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
router.use("/decor-package", require("./decor-package"));
router.use("/event", require("./event"));
router.use("/payment", require("./payment"));
router.use("/file", require("./file"));
router.use("/quotation", require("./quotation"));
router.use("/event-mandatory-question", require("./event-mandatory-question"));
router.use("/label", require("./label"));
router.use("/unit", require("./unit"));
router.use("/raw-material", require("./raw-material"));
router.use("/attribute", require("./attribute"));
router.use("/add-on", require("./add-on"));
router.use("/category", require("./category"));
router.use("/coupon", require("./coupon"));
router.use("/discount", require("./discount"));
router.use("/taxation", require("./taxation"));
router.use("/product-type", require("./product-type"));
router.use("/pricing-variation", require("./pricing-variation"));
router.use("/config", require("./config"));
router.use("/task", require("./task"));
router.use("/event-community", require("./event-community"));
router.use("/event-type", require("./event-type"));
router.use("/event-lost-response", require("./event-lost-response"));

module.exports = router;
