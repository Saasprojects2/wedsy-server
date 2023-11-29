const User = require("../models/User");

const GetUser = (req, res) => {
  const { user_id } = req.auth;
  User.findById({ _id: user_id })
    .exec()
    .then((result) => {
      if (result) {
        const { name, phone, email, address } = result;
        res.send({ name, phone, email, address });
      } else {
        res.status(404).send();
      }
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

const UpdateUser = (req, res) => {
  const { user_id } = req.auth;
  const { name, phone, email, address } = req.body;
  if ((!name || !email || !phone) && !address) {
    res.status(400).send();
    return;
  }
  User.findByIdAndUpdate(
    { _id: user_id },
    { $set: name ? { name, phone, email } : { address } }
  )
    .exec()
    .then((result) => {
      if (result) {
        res.send({ message: "success" });
      } else {
        res.status(400).send();
      }
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

const AddToWishList = (req, res) => {
  const { user_id } = req.auth;
  const { wishlist } = req.params;
  const { _id } = req.body;
  if (!_id || !wishlist) {
    res.status(400).send({ message: "Incomplete Data" });
  } else if (wishlist === "decor") {
    User.findByIdAndUpdate(
      { _id: user_id },
      { $addToSet: { "wishlist.decor": _id } }
    )
      .exec()
      .then((result) => {
        if (result) {
          res.send({ message: "success" });
        } else {
          res.status(400).send();
        }
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  }
};

const RemoveFromWishList = (req, res) => {
  const { user_id } = req.auth;
  const { wishlist } = req.params;
  const { _id } = req.body;
  if (!_id || !wishlist) {
    res.status(400).send({ message: "Incomplete Data" });
  } else if (wishlist === "decor") {
    User.findByIdAndUpdate(
      { _id: user_id },
      { $pull: { "wishlist.decor": _id } }
    )
      .exec()
      .then((result) => {
        if (result) {
          res.send({ message: "success" });
        } else {
          res.status(400).send();
        }
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

const IsAddedToWishlist = (req, res) => {
  const { _id, product } = req.query;
  const { user_id } = req.auth;
  if (!product || !_id) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    User.findById({ _id: user_id }, "wishlist")
      .exec()
      .then((result) => {
        const { wishlist } = result;
        if (product === "decor") {
          if (wishlist.decor.includes(_id)) {
            res.send({ message: "success", wishlist: true });
          } else {
            res.send({ message: "success", wishlist: false });
          }
        } else {
          res.send({ message: "success", wishlist: false });
        }
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  }
};

module.exports = {
  GetUser,
  UpdateUser,
  AddToWishList,
  GetWishList,
  GetWishListAll,
  RemoveFromWishList,
  IsAddedToWishlist,
};
