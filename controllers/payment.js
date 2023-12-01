const Event = require("../models/Event");
const Payment = require("../models/Payment");
const { CreatePayment, GetPaymentStatus } = require("../utils/payment");

const CreateEventPayment = (req, res) => {
  const { user_id } = req.auth;
  const { eventId, eventDayId } = req.body;
  Event.findOne({
    _id: eventId,
    user: user_id,
    eventDays: { $elemMatch: { _id: eventDayId } },
  })
    .then((result) => {
      if (result) {
        const { eventDays } = result;
        let eventDay = eventDays.filter((item) => item._id == eventDayId)[0];
        if (eventDay) {
          const { finalized, approved, paymentDone } = eventDay.status;
          if (finalized && approved && !paymentDone) {
            const decorItems = eventDay.decorItems;
            let amount = decorItems.reduce((accumulator, currentObject) => {
              return accumulator + currentObject.price;
            }, 0);
            amount *= 100;
            if (amount > 0) {
              Payment.findOne({
                user: user_id,
                event: eventId,
                eventDay: eventDayId,
              })
                .then((paymentFound) => {
                  if (paymentFound) {
                    res.status(200).send({
                      message: "success",
                      _id: paymentFound._id,
                      order_id: paymentFound.razporPayId,
                      amount: paymentFound.amount,
                    });
                  } else {
                    new Payment({
                      user: user_id,
                      event: eventId,
                      eventDay: eventDayId,
                      amount,
                      amountPaid: 0,
                      amountDue: amount,
                    })
                      .save()
                      .then((result) => {
                        CreatePayment({ _id: result._id })
                          .then((order) => {
                            res.status(200).send({
                              message: "success",
                              _id: result._id,
                              order_id: order.id,
                              amount,
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
              res.status(400).send({ message: "No items to pay" });
            }
          } else {
            res.status(400).send({ message: "Event note ready for payment." });
          }
        } else {
          res.status(404).send({ message: "Event not found" });
        }
        // res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const UpdatePayment = (req, res) => {
  const { user_id } = req.auth;
  const { order_id } = req.params;
  const { response } = req.body;
  GetPaymentStatus({ order_id, response })
    .then((order) => {
      if (order.status === "paid") {
        Payment.findOne({ user: user_id, razporPayId: order_id })
          .then((payment) => {
            const { event, eventDay } = payment;
            Event.findOneAndUpdate(
              {
                _id: event,
                user: user_id,
                eventDays: { $elemMatch: { _id: eventDay } },
              },
              { $set: { "eventDays.$.status.paymentDone": true } }
            )
              .then((result) => {
                res.status(200).send({ message: "success" });
              })
              .catch((error) => {
                res.status(400).send({ message: "error", error });
              });
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

const GetAllPayments = (req, res) => {
  const { user_id } = req.auth;
  Payment.find({ user: user_id })
    .populate("event")
    .then((result) => res.status(200).send(result))
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

module.exports = { CreateEventPayment, UpdatePayment, GetAllPayments };
