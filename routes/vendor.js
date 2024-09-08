const express = require("express");
const router = express.Router();

const vendor = require("../controllers/vendor");
const {
  CheckLogin,
  CheckAdminLogin,
  CheckVendorLogin,
} = require("../middlewares/auth");

router.post("/", vendor.CreateNew);
router.get("/", CheckAdminLogin, vendor.GetAll);
router.get("/:_id", CheckAdminLogin, vendor.Get);
router.post("/:_id/notes", vendor.AddNotes);
router.put("/", CheckVendorLogin, vendor.Update);
router.put("/:_id", CheckAdminLogin, vendor.Update);
router.delete("/:_id", CheckAdminLogin, vendor.Delete);
router.delete("/", CheckAdminLogin, vendor.DeleteVendors);

module.exports = router;
