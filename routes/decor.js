const express = require("express");
const router = express.Router();

const decor = require("../controllers/decor");

router.post("/", decor.CreateNew);
router.get("/", decor.GetAll);
router.get("/:_id", decor.Get);
// router.put("/:_id", decor.Update);
// router.delete("/:_id", decor.Delete);

module.exports = router;
