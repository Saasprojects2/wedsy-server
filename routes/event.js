const express = require("express");
const router = express.Router();

const { CheckLogin, CheckAdminLogin } = require("../middlewares/auth");
const event = require("../controllers/event");

router.post("/", CheckLogin, event.CreateNew);
router.get("/", CheckLogin, event.GetAll);
router.get("/:_id", CheckLogin, event.Get);
router.put("/:_id", CheckLogin, event.Update);
router.post("/:_id/send", CheckAdminLogin, event.SendEventToClient);
router.post("/:_id/eventDay", CheckLogin, event.AddEventDay);
router.put("/:_id/eventDay/:eventDay", CheckLogin, event.UpdateEventDay);
router.put("/:_id/eventDay/:eventDay/notes", CheckLogin, event.UpdateNotes);
router.post("/:_id/decor/:dayId", CheckLogin, event.AddDecorInEventDay);
router.delete("/:_id/decor/:dayId", CheckLogin, event.RemoveDecorInEventDay);
router.post(
  "/:_id/decor-package/:dayId",
  CheckLogin,
  event.AddDecorPackageInEventDay
);
router.delete(
  "/:_id/decor-package/:dayId",
  CheckLogin,
  event.RemoveDecorPackageInEventDay
);
router.post("/:_id/finalize/:dayId", CheckLogin, event.FinalizeEventDay);
router.post("/:_id/finalize", CheckLogin, event.FinalizeEvent);
router.post("/:_id/approve/:dayId", CheckAdminLogin, event.ApproveEventDay);
router.delete(
  "/:_id/approve/:dayId",
  CheckAdminLogin,
  event.RemoveEventDayApproval
);
router.post("/:_id/approve", CheckAdminLogin, event.ApproveEvent);
router.delete("/:_id/approve", CheckAdminLogin, event.RemoveEventApproval);
router.put(
  "/:_id/custom-items/:dayId",
  CheckLogin,
  event.UpdateCustomItemsInEventDay
);
router.put(
  "/:_id/mandatory-items/:dayId",
  CheckLogin,
  event.UpdateMandatoryItemsInEventDay
);

module.exports = router;
