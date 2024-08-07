const express = require("express");
const router = express.Router();

const notification = require("../controllers/notification");
const { CheckLogin, CheckAdminLogin } = require("../middlewares/auth");

router.post("/", CheckAdminLogin, notification.CreateNew);
router.get("/", CheckAdminLogin, notification.GetAll);

module.exports = router;
