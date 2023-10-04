const express = require("express");
const router = express.Router();

const { CheckLogin } = require("../middlewares/auth");
const event = require("../controllers/event");

router.post("/", CheckLogin, event.CreateNew);
router.get("/", CheckLogin, event.GetAll);
router.get("/:_id", CheckLogin, event.Get);
router.post("/:_id", CheckLogin, event.AddEventDay);

module.exports = router;
