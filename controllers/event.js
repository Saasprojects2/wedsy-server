const Event = require("../models/Event");

const CreateNew = (req, res) => {
  const { user_id } = req.auth;
  const { name, community, eventDay, date, time, venue } = req.body;
  if (!name || !community || !eventDay || !date || !time || !venue) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    new Event({
      user: user_id,
      name,
      community,
      eventDays: [{ name: eventDay, date, time, venue }],
    })
      .save()
      .then((result) => {
        res.status(200).send({ message: "success", _id: result._id });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const AddEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  const { name, date, time, venue } = req.body;
  if (!name || !date || !time || !venue) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findByIdAndUpdate(
      { _id, user: user_id },
      { $addToSet: { eventDays: { name, date, time, venue } } }
    )
      .then((result) => {
        res.status(200).send({ message: "success" });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const GetAll = (req, res) => {
  const { user_id } = req.auth;
  Event.find({ user: user_id })
    .exec()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
        data: { skip, validPage, totalPages, limit, page },
      });
    });
};

const Get = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  Event.findById({ _id, user: user_id })
    .then((result) => {
      if (!result) {
        res.status(404).send();
      } else {
        res.send(result);
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

module.exports = { CreateNew, GetAll, Get, AddEventDay };
