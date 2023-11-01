const express = require("express");
const router = express.Router();

const enquiry = require("../controllers/enquiry");
const { CheckLogin, CheckAdminLogin } = require("../middlewares/auth");

router.post("/", enquiry.CreateNew);
router.get("/", CheckAdminLogin, enquiry.GetAll);

module.exports = router;
