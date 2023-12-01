const express = require("express");
const router = express.Router();

const { CheckLogin } = require("../middlewares/auth");
const payment = require("../controllers/payment");

router.get("/", CheckLogin, payment.GetAllPayments);
router.post("/", CheckLogin, payment.CreateEventPayment);
router.put("/:order_id", CheckLogin, payment.UpdatePayment);

module.exports = router;
