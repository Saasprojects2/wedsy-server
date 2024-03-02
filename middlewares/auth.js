const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

function CheckToken(req, res, next) {
  if (!req.headers.authorization) {
    req.auth = {
      user_id: "",
      user: {},
      isAdmin: false,
    };
    next();
    return;
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    req.auth = {
      user_id: "",
      user: {},
      isAdmin: false,
    };
    next();
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET, function (err, result) {
    if (err) {
      req.auth = {
        user_id: "",
        user: {},
        isAdmin: false,
      };
      next();
      return;
    } else {
      const { _id, isAdmin } = result;
      if (_id && isAdmin) {
        Admin.findById({ _id })
          .then((user) => {
            if (!user) {
              req.auth = {
                user_id: "",
                user: {},
                isAdmin: false,
              };
              next();
              return;
            } else {
              req.auth = {
                user_id: _id,
                user,
                roles: user.roles,
                isAdmin: true,
              };
              next();
            }
          })
          .catch((error) => {
            req.auth = {
              user_id: "",
              user: {},
              isAdmin: false,
            };
            next();
            return;
          });
      } else if (_id) {
        User.findById({ _id })
          .then((user) => {
            if (!user) {
              req.auth = {
                user_id: "",
                user: {},
                isAdmin: false,
              };
              next();
              return;
            } else {
              req.auth = { user_id: _id, user, isAdmin: false };
              next();
            }
          })
          .catch((error) => {
            req.auth = {
              user_id: "",
              user: {},
              isAdmin: false,
            };
            next();
            return;
          });
      } else {
        req.auth = {
          user_id: "",
          user: {},
          isAdmin: false,
        };
        next();
        return;
      }
    }
  });
}

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
      const { _id, isAdmin } = result;
      if (_id && isAdmin) {
        Admin.findById({ _id })
          .then((user) => {
            if (!user) {
              res.status(401).send({ message: "invalid user" });
            } else {
              req.auth = {
                user_id: _id,
                user,
                roles: user.roles,
                isAdmin: true,
              };
              next();
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      } else if (_id) {
        User.findById({ _id })
          .then((user) => {
            if (!user) {
              res.status(401).send({ message: "invalid user" });
            } else {
              req.auth = { user_id: _id, user, isAdmin: false };
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

function CheckAdminLogin(req, res, next) {
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
      const { _id, isAdmin } = result;
      if (_id && isAdmin) {
        Admin.findById({ _id })
          .then((user) => {
            if (!user) {
              res.status(401).send({ message: "invalid user" });
            } else {
              req.auth = {
                user_id: _id,
                user,
                roles: user.roles,
                isAdmin: true,
              };
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

module.exports = { CheckLogin, CheckAdminLogin, CheckToken };
