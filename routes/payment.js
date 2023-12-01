const express = require("express");
const router = express.Router();

const { CheckLogin } = require("../middlewares/auth");
const payment = require("../controllers/payment");

router.post("/", CheckLogin, payment.CreateEventPayment);
router.put("/:order_id", CheckLogin, payment.UpdatePayment);

module.exports = router;
