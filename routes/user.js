const express = require("express");
const router = express.Router();

const { CheckLogin } = require("../middlewares/auth");
const user = require("../controllers/user");

router.get("/wishlist", CheckLogin, user.GetWishListAll);
router.get("/wishlist/:wishlist", CheckLogin, user.GetWishList);
router.post("/wishlist/:wishlist", CheckLogin, user.AddToWishList);
router.delete("/wishlist/:wishlist", CheckLogin, user.RemoveFromWishList);
router.get("/is-added-to-wishlist", CheckLogin, user.IsAddedToWishlist);

module.exports = router;
