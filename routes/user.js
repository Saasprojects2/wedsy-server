const express = require("express");
const router = express.Router();

const { CheckLogin } = require("../middlewares/auth");
const user = require("../controllers/user");

router.post("/wishlist/:wishlist", CheckLogin, user.AddToWishList);
router.get("/wishlist", CheckLogin, user.GetWishListAll);
router.get("/wishlist/:wishlist", CheckLogin, user.GetWishList);

module.exports = router;
