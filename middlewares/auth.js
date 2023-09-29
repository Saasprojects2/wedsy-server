const jwt = require("jsonwebtoken");
const User = require("../models/User");

function CheckLogin(req, res, next) {
  if (!req.headers.authorization) {
    res.status(400).send({ message: "No Auth Token" });
    return;
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(400).send({ message: "No Auth Token" });
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET, function (err, result) {
    if (err) {
      res.status(400).send({ message: "error", error: err });
    } else {
      const { _id } = result;
      if (_id) {
        User.findById({ _id })
          .then((user) => {
            if (!user) {
              res.status(401).send({ message: "invalid user" });
            } else {
              req.auth = { user_id: _id, user };
              next();
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      } else {
        res.status(400).send({ message: "unknown error" });
      }
    }
  });
}

module.exports = { CheckLogin };
