const Event = require("../models/Event");
const Payment = require("../models/Payment");
const {
  CreatePayment,
  GetPaymentStatus,
  GetPaymentTransactions,
} = require("../utils/payment");

const CreateNewPayment = (req, res) => {
  const { user_id } = req.auth;
  const { event, paymentFor, paymentMethod, amount } = req.body;
  if (paymentFor === "event" && event && paymentMethod === "razporpay") {
    new Payment({
      user: user_id,
      event: event,
      paymentFor,
      paymentMethod,
      amount: amount * 100,
      amountPaid: 0,
      amountDue: amount * 100,
    })
      .save()
      .then((result) => {
        CreatePayment({ _id: result._id })
          .then((order) => {
            res.status(200).send({
              message: "success",
              _id: result._id,
              order_id: order.id,
              amount: amount * 100,
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
  // Event.findOne({
  //   _id: eventId,
  //   user: user_id,
  //   eventDays: { $elemMatch: { _id: eventDayId } },
  // })
  //   .then((result) => {
  //     if (result) {
  //       const { eventDays } = result;
  //       let eventDay = eventDays.filter((item) => item._id == eventDayId)[0];
  //       if (eventDay) {
  //         const { finalized, approved, paymentDone } = eventDay.status;
  //         if (finalized && approved && !paymentDone) {
  //           const decorItems = eventDay.decorItems;
  //           const packages = eventDay.packages;
  //           let decorItemsAmount = decorItems.reduce(
  //             (accumulator, currentObject) => {
  //               return accumulator + currentObject.price;
  //             },
  //             0
  //           );
  //           let packagesAmount = packages.reduce(
  //             (accumulator, currentObject) => {
  //               return accumulator + currentObject.price;
  //             },
  //             0
  //           );
  //           let other_costs = eventDay.other_costs.total_other_costs || 0;
  //           let amount = decorItemsAmount + packagesAmount + other_costs;
  //           amount *= 100;
  //           if (amount > 0) {
  //             Payment.findOne({
  //               user: user_id,
  //               event: eventId,
  //               eventDay: eventDayId,
  //             })
  //               .then((paymentFound) => {
  //                 if (paymentFound) {
  //                   res.status(200).send({
  //                     message: "success",
  //                     _id: paymentFound._id,
  //                     order_id: paymentFound.razporPayId,
  //                     amount: paymentFound.amount,
  //                   });
  //                 } else {
  //                   new Payment({
  //                     user: user_id,
  //                     event: eventId,
  //                     eventDay: eventDayId,
  //                     amount,
  //                     amountPaid: 0,
  //                     amountDue: amount,
  //                     paymentMethod: paymentMethod || "default",
  //                   })
  //                     .save()
  //                     .then((result) => {
  //                       CreatePayment({ _id: result._id })
  //                         .then((order) => {
  //                           res.status(200).send({
  //                             message: "success",
  //                             _id: result._id,
  //                             order_id: order.id,
  //                             amount,
  //                           });
  //                         })
  //                         .catch((error) => {
  //                           res.status(400).send({ message: "error", error });
  //                         });
  //                     })
  //                     .catch((error) => {
  //                       res.status(400).send({ message: "error", error });
  //                     });
  //                 }
  //               })
  //               .catch((error) => {
  //                 res.status(400).send({ message: "error", error });
  //               });
  //           } else {
  //             res.status(400).send({ message: "No items to pay" });
  //           }
  //         } else {
  //           res.status(400).send({ message: "Event not ready for payment." });
  //         }
  //       } else {
  //         res.status(404).send({ message: "Event not found" });
  //       }
  //       // res.status(200).send({ message: "success" });
  //     } else {
  //       res.status(404).send({ message: "Event not found" });
  //     }
  //   })
  //   .catch((error) => {
  //     res.status(400).send({ message: "error", error });
  //   });
};

const UpdatePayment = (req, res) => {
  const { user_id } = req.auth;
  const { order_id } = req.params;
  const { response } = req.body;
  GetPaymentStatus({ order_id, response })
    .then((order) => {
      if (order.status === "paid") {
        Payment.findOne({ user: user_id, razporPayId: order_id })
          .then(async (payment) => {
            try {
              const event = await Event.findOne({
                user: user_id,
                _id: payment.event,
              });
              const payments = await Payment.find({
                user: user_id,
                event: payment.event,
                status: "paid",
              });
              let eventTotal = event.amount.total;
              let paymentTotal = payments.reduce(
                (accumulator, currentValue) => {
                  return accumulator + currentValue.amountPaid / 100;
                },
                0
              );
              if (paymentTotal < eventTotal) {
                Event.findOneAndUpdate(
                  {
                    _id: event._id,
                    user: user_id,
                  },
                  {
                    $set: {
                      "amount.due": eventTotal - paymentTotal,
                      "amount.paid": paymentTotal,
                    },
                  }
                )
                  .then((result) => {
                    res.status(200).send({ message: "success" });
                  })
                  .catch((error) => {
                    res.status(400).send({ message: "error", error });
                  });
              } else if (paymentTotal == eventTotal) {
                Event.findOneAndUpdate(
                  {
                    _id: event._id,
                    user: user_id,
                  },
                  {
                    $set: {
                      "amount.due": eventTotal - paymentTotal,
                      "amount.paid": paymentTotal,
                      "status.paymentDone": true,
                      "eventDays.$[elem].status.paymentDone": true,
                    },
                  },
                  {
                    arrayFilters: [
                      {
                        "elem._id": { $in: event.eventDays.map((i) => i._id) },
                      },
                    ],
                  }
                )
                  .then((result) => {
                    res.status(200).send({ message: "success" });
                  })
                  .catch((error) => {
                    res.status(400).send({ message: "error", error });
                  });
              } else {
                console.log(
                  `Error with Payments, event:${event._id}. Payment: ${paymentTotal}, Event: ${eventTotal}`
                );
              }
            } catch (error) {
              console.log(error);
              res.status(400).send({ message: "error", error });
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      } else {
        res.status(200).send({ message: "success" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const GetAllPayments = async (req, res) => {
  const { user_id, isAdmin } = req.auth;
  if (isAdmin) {
    // Admin Controller
    const { status, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = {};
    const sortQuery = {};
    if (status) {
      query.status = status;
    }
    if (sort) {
      if (sort === "Amount:Low-to-High") {
        sortQuery["amount"] = 1;
      } else if (sort === "Amount:High-to-Low") {
        sortQuery["amount"] = -1;
      }
    }
    Payment.countDocuments(query)
      .then(async (total) => {
        const totalPages = Math.ceil(total / limit);
        const validPage = page % totalPages;
        const skip =
          validPage === 0 || validPage === null || validPage === undefined
            ? 0
            : (validPage - 1) * limit;
        const allPayments = await Payment.find({});
        const { totalAmount, amountPaid, amountDue } = allPayments.reduce(
          (accumulator, payment) => {
            accumulator.totalAmount += payment.amount;
            accumulator.amountPaid += payment.amountPaid;
            accumulator.amountDue += payment.amountDue;
            return accumulator;
          },
          { totalAmount: 0, amountPaid: 0, amountDue: 0 }
        );
        Payment.find(query)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
          .populate("user event")
          .exec()
          .then((result) => {
            res.send({
              list: result,
              totalPages,
              page,
              limit,
              totalAmount,
              amountPaid,
              amountDue,
            });
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
  } else {
    // User Controller
    let payments = await Payment.find({ user: user_id })
      .populate("event")
      .exec();
    let events = await Event.find({ user: user_id });
    let { totalAmount, amountPaid, amountDue } = events
      ?.filter((e) => e?.status?.approved)
      .reduce(
        (accumulator, e) => {
          accumulator.totalAmount += e?.amount?.total;
          accumulator.amountPaid += e?.amount?.paid;
          accumulator.amountDue += e?.amount?.due;
          return accumulator;
        },
        { totalAmount: 0, amountPaid: 0, amountDue: 0 }
      );
    let received = payments
      .filter((p) => p?.status === "paid")
      .reduce((accumulator, e) => {
        return accumulator + e.amountPaid;
      }, 0);
    Promise.all(
      payments.map(async (item) => {
        let transactions = [];
        if (item?.razporPayId) {
          transactions = await GetPaymentTransactions({
            order_id: item?.razporPayId,
          });
        }
        return { ...item.toObject(), transactions };
      })
    ).then((result) => {
      res.send({ totalAmount, amountPaid, amountDue, payments: result });
    });
  }
};

const GetAllTransactions = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { order_id } = req.params;
  if (isAdmin) {
    GetPaymentTransactions({ order_id })
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.send(401);
  }
};

module.exports = {
  CreateNewPayment,
  UpdatePayment,
  GetAllPayments,
  GetAllTransactions,
};
