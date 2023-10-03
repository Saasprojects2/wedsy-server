const User = require("../models/User");

const AddToWishList = (req, res) => {
  const { user_id } = req.auth;
  const { _id, wishlist } = req.body;
  if (!_id || !wishlist) {
    res.status(400).send({ message: "Incomplete Data" });
  } else if (wishlist === "decor") {
    User.findByIdAndUpdate(
      { _id: user_id },
      { $addToSet: { "wishlist.decor": _id } }
    )
      .exec()
      .then((result) => {
        res.send({ message: "success" });
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  }
};

const GetWishListAll = (req, res) => {
  const { user } = req.auth;
  res.send(user.wishlist);
};

const GetWishList = (req, res) => {
  const { wishlist } = req.params;
  const { user_id } = req.auth;
  if (!wishlist) {
    res.status(400).send({ message: "Incomplete Data" });
  } else if (wishlist === "decor") {
    User.findById({ _id: user_id }, "wishlist")
      .populate("wishlist.decor")
      .exec()
      .then((result) => {
        res.send(result.wishlist.decor);
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  }
};

module.exports = { AddToWishList, GetWishList, GetWishListAll };
