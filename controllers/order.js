const Config = require("../models/Config");
const Order = require("../models/Order");
const VendorPersonalPackageBooking = require("../models/VendorPersonalPackageBooking");
const Vendor = require("../models/Vendor");
const WedsyPackageBooking = require("../models/WedsyPackageBooking");
const WedsyPackageBookingRequest = require("../models/WedsyPackageBookingRequest");
const BiddingBid = require("../models/BiddingBid");
const Chat = require("../models/Chat");
const ChatContent = require("../models/ChatContent");
const BiddingBooking = require("../models/BiddingBooking");
const router = require("../routes/order");

const CreateOrder = async (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  if (!isAdmin && !isVendor) {
    const { source } = req.body;
    if (source === "Wedsy-Package") {
      const { wedsyPackages, date, time, address } = req.body;
      if (wedsyPackages.length === 0 || !date || !time || !address.place_id) {
        res.status(400).send({ message: "Incomplete Data" });
      } else {
        const packageBooking = await new WedsyPackageBooking({
          wedsyPackages,
          date,
          time,
          address,
        }).save();
        const { data: taxation } = await Config.findOne({
          code: "MUA-Taxation",
        });
        const { data: bookingAmount } = await Config.findOne({
          code: "MUA-BookingAmount",
        });
        let price = wedsyPackages?.reduce((accumulator, item) => {
          return accumulator + item.quantity * item.price;
        }, 0);
        let cgst = price * (taxation?.wedsyPackage?.cgst / 100);
        let sgst = price * (taxation?.wedsyPackage?.sgst / 100);
        let total = price + cgst + sgst;
        let payableToWedsy =
          total * (bookingAmount?.wedsyPackage?.percentage / 100);
        let payableToVendor =
          total * ((100 - bookingAmount?.wedsyPackage?.percentage) / 100);
        const vendors = await Vendor.find({ packageStatus: true });
        await Promise.all(
          vendors.map((item) => {
            new WedsyPackageBookingRequest({
              wedsyPackageBooking: packageBooking?._id,
              vendor: item?._id,
              status: {
                accepted: false,
                rejected: false,
              },
            }).save();
          })
        );
        new Order({
          user: user_id,
          source: "Wedsy-Package",
          wedsyPackageBooking: packageBooking?._id,
          status: {
            booked: true,
            finalized: false,
            paymentDone: false,
            completed: false,
            lost: false,
          },
          amount: {
            total: total,
            due: total,
            paid: 0,
            price: price,
            cgst: cgst,
            sgst: sgst,
            payableToWedsy: payableToWedsy,
            payableToVendor: payableToVendor,
            receivedByWedsy: 0,
            receivedByVendor: 0,
          },
        })
          .save()
          .then((result) => {
            res
              .status(201)
              .send({ message: "success", id: result._id, amount: total });
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      }
    } else if (source === "Personal-Package") {
      const { vendor, personalPackages, date, time, address } = req.body;
      if (
        !vendor ||
        personalPackages.length === 0 ||
        !date ||
        !time ||
        !address.place_id
      ) {
        res.status(400).send({ message: "Incomplete Data" });
      } else {
        const packageBooking = await new VendorPersonalPackageBooking({
          vendor,
          personalPackages,
          date,
          time,
          address,
        }).save();
        const { data: taxation } = await Config.findOne({
          code: "MUA-Taxation",
        });
        const { data: bookingAmount } = await Config.findOne({
          code: "MUA-BookingAmount",
        });
        let price = personalPackages?.reduce((accumulator, item) => {
          return accumulator + item.quantity * item.price;
        }, 0);
        let cgst = price * (taxation?.personalPackage?.cgst / 100);
        let sgst = price * (taxation?.personalPackage?.sgst / 100);
        let total = price + cgst + sgst;
        let payableToWedsy =
          total * (bookingAmount?.personalPackage?.percentage / 100);
        let payableToVendor =
          total * ((100 - bookingAmount?.personalPackage?.percentage) / 100);
        new Order({
          vendor,
          user: user_id,
          source: "Personal-Package",
          vendorPersonalPackageBooking: packageBooking?._id,
          status: {
            booked: true,
            finalized: false,
            paymentDone: false,
            completed: false,
            lost: false,
          },
          amount: {
            total: total,
            due: total,
            paid: 0,
            price: price,
            cgst: cgst,
            sgst: sgst,
            payableToWedsy: payableToWedsy,
            payableToVendor: payableToVendor,
            receivedByWedsy: 0,
            receivedByVendor: 0,
          },
        })
          .save()
          .then((result) => {
            res
              .status(201)
              .send({ message: "success", id: result._id, amount: total });
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      }
    } else if (source === "Bidding") {
      const { vendor, events, bid } = req.body;
      if (!vendor || !bid || events.length === 9) {
        res.status(400).send({ message: "Incomplete Data" });
      } else {
        const biddingBooking = await new BiddingBooking({
          vendor,
          user: user_id,
          events,
        }).save();
        const { data: taxation } = await Config.findOne({
          code: "MUA-Taxation",
        });
        const { data: bookingAmount } = await Config.findOne({
          code: "MUA-BookingAmount",
        });
        let price = bid;
        let payableToWedsy = 0;
        let payableToVendor = 0;

        if (bookingAmount?.bidding?.bookingAmount === "percentage") {
          let p = bookingAmount?.bidding?.percentage;
          payableToWedsy = price * (p / 100);
          payableToVendor = price * (1 - p / 100);
        } else if (bookingAmount?.bidding?.bookingAmount === "condition") {
          for (let conditionObj of bookingAmount?.bidding?.condition) {
            // Check the condition type and compare the value
            if (
              (conditionObj.condition === "lt" && price < conditionObj.value) ||
              (conditionObj.condition === "lte" &&
                price <= conditionObj.value) ||
              (conditionObj.condition === "eq" &&
                price === conditionObj.value) ||
              (conditionObj.condition === "gte" &&
                price >= conditionObj.value) ||
              (conditionObj.condition === "gt" && price > conditionObj.value)
            ) {
              if (conditionObj.bookingAmount === "amount") {
                payableToWedsy = conditionObj.amount;
                payableToVendor = price - conditionObj.amount;
              } else if (conditionObj.bookingAmount === "percentage") {
                let p = conditionObj.percentage;
                payableToWedsy = price * (p / 100);
                payableToVendor = price * (1 - p / 100);
              }
            }
          }
        }

        payableToVendor =
          payableToVendor *
          (1 + taxation?.bidding?.cgst / 100 + taxation?.bidding?.sgst / 100);
        payableToWedsy =
          payableToWedsy *
          (1 + taxation?.bidding?.cgst / 100 + taxation?.bidding?.sgst / 100);

        let cgst = price * (taxation?.bidding?.cgst / 100);
        let sgst = price * (taxation?.bidding?.sgst / 100);
        let total = price + cgst + sgst;

        new Order({
          vendor,
          user: user_id,
          source: "Bidding",
          biddingBooking: biddingBooking?._id,
          status: {
            booked: true,
            finalized: true,
            paymentDone: false,
            completed: false,
            lost: false,
          },
          amount: {
            total: total,
            due: total,
            paid: 0,
            price: price,
            cgst: cgst,
            sgst: sgst,
            payableToWedsy: payableToWedsy,
            payableToVendor: payableToVendor,
            receivedByWedsy: 0,
            receivedByVendor: 0,
          },
        })
          .save()
          .then((result) => {
            res.status(201).send({
              message: "success",
              id: result._id,
              amount: payableToWedsy,
            });
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      }
    } else {
      res.status(400).send({
        message: "error",
        error,
      });
    }
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const GetAllOrders = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  if (isVendor) {
    Order.find({ vendor: user_id })
      .populate(
        "biddingBooking wedsyPackageBooking vendorPersonalPackageBooking user"
      )
      .then((result) => {
        if (!result) {
          res.status(404).send();
        } else {
          res.send(result);
        }
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else if (isAdmin) {
    Order.find({})
      .populate(
        "biddingBooking wedsyPackageBooking vendorPersonalPackageBooking user vendor"
      )
      .then((result) => {
        if (!result) {
          res.status(404).send();
        } else {
          res.send(result);
        }
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else {
    Order.find({ user: user_id })
      .populate(
        "biddingBooking wedsyPackageBooking vendorPersonalPackageBooking vendor"
      )
      .then((result) => {
        if (!result) {
          res.status(404).send();
        } else {
          res.send(result);
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

const GetOrder = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (isVendor) {
    const { populate } = req.query;
    if (populate === "true") {
      Order.findOne({ _id, vendor: user_id })
        .populate("biddingBooking")
        .populate({
          path: "vendorPersonalPackageBooking",
          populate: {
            path: "personalPackages.package",
          },
        })
        .populate("user")
        .populate({
          path: "wedsyPackageBooking",
          populate: {
            path: "wedsyPackages.package",
          },
        })
        .then((result) => {
          if (!result) {
            res.status(404).send();
          } else {
            res.send(result);
          }
        })
        .catch((error) => {
          res.status(400).send({
            message: "error",
            error,
          });
        });
    } else {
      Order.findOne({ _id, vendor: user_id })
        .then((result) => {
          if (!result) {
            res.status(404).send();
          } else {
            res.send(result);
          }
        })
        .catch((error) => {
          res.status(400).send({
            message: "error",
            error,
          });
        });
    }
  } else if (isAdmin) {
    res.status(400).send({
      message: "error",
      error: {},
    });
  } else {
    const { populate } = req.query;
    if (populate === "true") {
      Order.findOne({ _id, user: user_id })
        .populate("biddingBooking")
        .populate({
          path: "vendorPersonalPackageBooking",
          populate: {
            path: "personalPackages.package",
          },
        })
        .populate("vendor")
        .populate({
          path: "wedsyPackageBooking",
          populate: {
            path: "wedsyPackages.package",
          },
        })
        .then((result) => {
          if (!result) {
            res.status(404).send();
          } else {
            res.send(result);
          }
        })
        .catch((error) => {
          res.status(400).send({
            message: "error",
            error,
          });
        });
    } else {
      Order.findOne({ _id, user: user_id })
        .then((result) => {
          if (!result) {
            res.status(404).send();
          } else {
            res.send(result);
          }
        })
        .catch((error) => {
          res.status(400).send({
            message: "error",
            error,
          });
        });
    }
  }
};

const MarkOrderCompleted = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (_id && isAdmin) {
    Order.findOneAndUpdate(
      {
        _id,
      },
      {
        $set: {
          "status.completed": true,
        },
      }
    ).then(async (orderResult) => {
      if (orderResult) {
        res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "not found" });
      }
    });
  } else {
    res.status(400).send({
      message: "error",
      error: {},
    });
  }
};

const AcceptVendorPersonalPackageBooking = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (_id) {
    VendorPersonalPackageBooking.findOneAndUpdate(
      { _id, vendor: user_id, "status.rejected": false },
      {
        $set: {
          "status.accepted": true,
        },
      }
    )
      .then((result) => {
        if (result) {
          Order.findOneAndUpdate(
            {
              vendorPersonalPackageBooking: _id,
              "status.finalized": false,
            },
            {
              $set: {
                vendor: user_id,
                "status.finalized": true,
              },
            }
          ).then(async (orderResult) => {
            if (orderResult) {
              let chat = await Chat.findOne({
                user: orderResult?.user,
                vendor: user_id,
              });
              if (!chat) {
                chat = await new Chat({
                  user: orderResult?.user,
                  vendor: user_id,
                }).save();
              }
              await new ChatContent({
                chat: chat?._id,
                contentType: "PersonalPackageAccepted",
                content: orderResult?.amount?.total,
                other: { order: orderResult?._id },
              }).save();
              res.status(200).send({ message: "success" });
            } else {
              res.status(404).send({ message: "not found" });
            }
          });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error: {},
    });
  }
};

const RejectVendorPersonalPackageBooking = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (_id) {
    VendorPersonalPackageBooking.findOneAndUpdate(
      { _id, vendor: user_id, "status.accepted": false },
      {
        $set: {
          "status.rejected": true,
        },
      }
    )
      .then((result) => {
        if (result) {
          Order.findOneAndUpdate(
            {
              vendorPersonalPackageBooking: _id,
              "status.finalized": false,
            },
            {
              $set: {
                vendor: user_id,
                "status.lost": true,
              },
            }
          ).then((orderResult) => {
            if (orderResult) {
              res.status(200).send({ message: "success" });
            } else {
              res.status(404).send({ message: "not found" });
            }
          });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const AcceptWedsyPackageBooking = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (_id) {
    WedsyPackageBookingRequest.findOneAndUpdate(
      { wedsyPackageBooking: _id, vendor: user_id, "status.rejected": false },
      {
        $set: {
          "status.accepted": true,
        },
      }
    )
      .then((result) => {
        if (result) {
          Order.findOneAndUpdate(
            {
              wedsyPackageBooking: _id,
              "status.finalized": false,
            },
            {
              $set: {
                vendor: user_id,
                "status.finalized": true,
              },
            },
            { new: true }
          ).then(async (orderResult) => {
            if (orderResult) {
              res.status(200).send({ message: "success" });
            } else {
              res.status(404).send({ message: "not found" });
            }
          });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const RejectWedsyPackageBooking = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (_id) {
    WedsyPackageBookingRequest.findOneAndUpdate(
      { wedsyPackageBooking: _id, vendor: user_id, "status.accepted": false },
      {
        $set: {
          "status.rejected": true,
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const AcceptBiddingBid = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  const { bid, vendor_notes } = req.body;
  if (_id) {
    BiddingBid.findOneAndUpdate(
      { bidding: _id, vendor: user_id, "status.rejected": false },
      {
        $set: {
          "status.accepted": true,
          bid,
          vendor_notes,
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const RejectBiddingBid = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  if (_id) {
    BiddingBid.findOneAndUpdate(
      { bidding: _id, vendor: user_id, "status.accepted": false },
      {
        $set: {
          "status.rejected": true,
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const GetVendorPersonalPackageBooking = async (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { stats } = req.query;
  if (isVendor) {
    if (stats === "Pending") {
      let count = await VendorPersonalPackageBooking.countDocuments({
        vendor: user_id,
        "status.accepted": false,
        "status.rejected": false,
      });
      res.status(200).json({
        message: "success",
        count,
      });
    } else {
      VendorPersonalPackageBooking.find({ vendor: user_id })
        .populate("personalPackages.package")
        .then((result) => {
          Promise.all(
            result.map((item) => {
              return new Promise((resolve, reject) => {
                Order.findOne({
                  vendorPersonalPackageBooking: item._id,
                  vendor: user_id,
                })
                  .populate("user")
                  .then((r) => {
                    resolve({
                      ...item.toObject(),
                      order: r ? r.toObject() : null,
                    });
                  })
                  .catch((error) => {
                    console.log(
                      "Error [Vendor Personal Package Booking:",
                      item._id,
                      error
                    );
                  });
              });
            })
          )
            .then((promiseResult) => {
              res.send(promiseResult);
            })
            .catch((error) => {
              res.status(400).send({ message: "error", error });
            });
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    }
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const GetWedsyPackageBooking = async (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { stats } = req.query;
  if (isVendor) {
    if (stats === "Pending") {
      let count = await WedsyPackageBookingRequest.countDocuments({
        vendor: user_id,
        "status.accepted": false,
        "status.rejected": false,
      });
      res.status(200).json({
        message: "success",
        count,
      });
    } else {
      WedsyPackageBookingRequest.find({ vendor: user_id })
        .populate({
          path: "wedsyPackageBooking",
          populate: {
            path: "wedsyPackages.package",
            model: "WedsyPackage",
          },
        })
        .then((result) => {
          Promise.all(
            result.map((item) => {
              if (item?.wedsyPackageBooking?._id) {
                return new Promise((resolve, reject) => {
                  Order.findOne({
                    wedsyPackageBooking: item?.wedsyPackageBooking?._id,
                  })
                    .populate("user")
                    .then((r) => {
                      resolve({
                        ...item.toObject(),
                        order: r ? r.toObject() : null,
                      });
                    })
                    .catch((error) => {
                      console.log(
                        "Error Wedsy Package Booking:",
                        item._id,
                        error
                      );
                    });
                });
              } else {
                return {
                  ...item.toObject(),
                  order: null,
                };
              }
            })
          )
            .then((promiseResult) => {
              res.send(promiseResult);
            })
            .catch((error) => {
              res.status(400).send({ message: "error", error });
            });
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    }
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

const GetBiddingBids = async (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { stats, biddingId } = req.query;
  if (isVendor) {
    if (stats === "Pending") {
      let count = await BiddingBid.countDocuments({
        vendor: user_id,
        "status.accepted": false,
        "status.rejected": false,
      });
      res.status(200).json({
        message: "success",
        count,
      });
    } else {
      BiddingBid.find(
        biddingId
          ? { bidding: biddingId, vendor: user_id }
          : { vendor: user_id }
      )
        .populate({
          path: "bidding",
          populate: {
            path: "user",
            model: "User",
          },
        })
        .then((result) => {
          Promise.all(
            result.map(async (item) => {
              const lowestBid = await BiddingBid.findOne({
                bid: { $gt: 0 }, // Bid must be greater than 0
                "status.accepted": true, // Status must be accepted
              })
                .sort({ bid: 1 }) // Sort in ascending order
                .select("bid") // Only select the 'bid' field
                .lean();
              if (item?.bidding?._id) {
                return new Promise((resolve, reject) => {
                  Order.findOne({
                    bidding: item?.bidding?._id,
                  })
                    .populate("user")
                    .then((r) => {
                      resolve({
                        ...item.toObject(),
                        order: r ? r.toObject() : null,
                        lowestBid,
                      });
                    })
                    .catch((error) => {
                      console.log(
                        "Error Wedsy Package Booking:",
                        item._id,
                        error
                      );
                    });
                });
              } else {
                return {
                  ...item.toObject(),
                  order: null,
                  lowestBid,
                };
              }
            })
          )
            .then((promiseResult) => {
              res.send(promiseResult);
            })
            .catch((error) => {
              res.status(400).send({ message: "error", error });
            });
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    }
  } else {
    res.status(400).send({
      message: "error",
      error,
    });
  }
};

module.exports = {
  CreateOrder,
  GetOrder,
  GetVendorPersonalPackageBooking,
  GetWedsyPackageBooking,
  AcceptVendorPersonalPackageBooking,
  RejectVendorPersonalPackageBooking,
  AcceptWedsyPackageBooking,
  RejectWedsyPackageBooking,
  GetBiddingBids,
  AcceptBiddingBid,
  RejectBiddingBid,
  GetAllOrders,
  MarkOrderCompleted,
};
