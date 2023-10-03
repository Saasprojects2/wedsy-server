const express = require("express");
const router = express.Router();

const enquiry = require("../controllers/enquiry");

router.post("/", enquiry.CreateNew);

module.exports = router;
