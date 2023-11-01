const Enquiry = require("../models/Enquiry");
const User = require("../models/User");
const { VerifyOTP } = require("../utils/otp");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

const CreateNew = (req, res) => {
  const { name, phone, verified, source, Otp, ReferenceId } = req.body;
  if (!name || !phone || !source || verified === undefined) {
    res.status(400).send({ message: "Incomplete Data" });
  } else if (verified && Otp && ReferenceId) {
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
                new Enquiry({
                  name,
                  phone,
                  verified,
                  source,
                })
                  .save()
                  .then((result) => {
                    res.send({
                      message: "Enquiry Added Successfully",
                      token,
                    });
                  })
                  .catch((error) => {
                    res.status(400).send({ message: "error", error });
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
                    new Enquiry({
                      name,
                      phone,
                      verified,
                      source,
                    })
                      .save()
                      .then((result) => {
                        res.send({
                          message: "Enquiry Added Successfully",
                          token,
                        });
                      })
                      .catch((error) => {
                        res.status(400).send({ message: "error", error });
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
  } else {
    new Enquiry({
      name,
      phone,
      verified: false,
      source,
    })
      .save()
      .then((result) => {
        res.status(201).send();
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const GetAll = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { source } = req.query;
  const query = {};
  if (source) {
    query.source = source;
  }
  Enquiry.countDocuments(query)
    .then((total) => {
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      Enquiry.find(query)
        .skip(skip)
        .limit(limit)
        .exec()
        .then((result) => {
          res.send({ list: result, totalPages, page, limit });
        })
        .catch((error) => {
          res.status(400).send({
            message: "error",
            error,
          });
        });
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

module.exports = { CreateNew, GetAll };
