const User = require("../models/User");
const { VerifyOTP, SendOTP } = require("../utils/otp");

const Login = (req, res) => {
  const { name, phone, Otp, ReferenceId } = req.body;
  if (phone.length !== 13 || !Otp || !ReferenceId) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    VerifyOTP(phone, ReferenceId, Otp)
      .then((result) => {
        if (result.Valid === true) {
          User.findOne({ phone })
            .then((user) => {
              if (user) {
                const { _id } = user;
                const token = jwt.sign(
                  { _id },
                  process.env.JWT_SECRET,
                  jwtConfig
                );
                res.send({
                  message: "Login Successful",
                  token,
                });
              } else {
                new User({
                  name,
                  phone,
                })
                  .save()
                  .then((result) => {
                    const { _id } = result;
                    const token = jwt.sign(
                      { _id },
                      process.env.JWT_SECRET,
                      jwtConfig
                    );
                    res.send({
                      message: "Login Successful",
                      token,
                    });
                  })
                  .catch((error) => {
                    res.status(400).send({ message: "error", error });
                  });
              }
            })
            .catch((error) => {
              res.status(400).send({ message: "error", error });
            });
        } else {
          res.status(400).send({ message: "Invalid OTP" });
        }
      })
      .catch((err) => {
        res.status(400).send({ message: "error", error: err });
      });
  }
};

const Get = (req, res) => {
  const { user } = req.auth;
  const { name, phone } = user;
  res.send({ name, phone });
};

const GetOTP = (req, res) => {
  const { phone } = req.body;
  if (phone && phone.length !== 13) {
    res.status(400).send({ message: "incorrect phone number" });
  } else {
    SendOTP(phone)
      .then((result) => {
        res.send({
          message: "OTP sent successfully",
          ReferenceId: result.ReferenceId,
        });
      })
      .catch((err) => {
        res.status(400).send({ message: "error", error: err });
      });
  }
};

module.exports = { Login, Get, GetOTP };
