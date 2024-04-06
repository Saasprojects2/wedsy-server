const express = require("express");
const router = express.Router();

const pricingVariation = require("../controllers/pricing-variation");
const { CheckLogin, CheckAdminLogin } = require("../middlewares/auth");

router.post("/", CheckAdminLogin, pricingVariation.CreateNew);
router.get("/", CheckAdminLogin, pricingVariation.GetAll);
router.get("/:_id", CheckAdminLogin, pricingVariation.Get);
router.put("/:_id", CheckAdminLogin, pricingVariation.Update);
router.put("/:_id/status", CheckAdminLogin, pricingVariation.UpdateStatus);
router.delete("/:_id", CheckAdminLogin, pricingVariation.Delete);

module.exports = router;
