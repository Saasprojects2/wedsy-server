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
      {
        $addToSet: {
          eventDays: {
            name,
            date,
            time,
            venue,
            decorItems: [],
            status: { finalized: false, approved: false, paymentDone: false },
          },
        },
      }
    )
      .then((result) => {
        res.status(200).send({ message: "success" });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const AddDecorInEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  const {
    decor,
    platform,
    flooring,
    dimensions,
    price,
    category,
    variant,
    quantity,
    unit,
  } = req.body;
  if (!decor || !category || !variant || !price || platform === undefined) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
      {
        $addToSet: {
          "eventDays.$.decorItems": {
            quantity,
            unit,
            decor,
            platform,
            flooring,
            dimensions,
            price,
            category,
            variant,
          },
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "Event not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const RemoveDecorInEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  const { decor } = req.body;
  if (!decor) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
      {
        $pull: {
          "eventDays.$.decorItems": {
            decor,
          },
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "Event not found" });
        }
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
      });
    });
};

const FinalizeEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  Event.findOneAndUpdate(
    { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
    {
      $set: {
        "eventDays.$.status.finalized": true,
      },
    }
  )
    .then((result) => {
      if (result) {
        res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const Get = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  const { populate } = req.query;
  let query = Event.findById({ _id, user: user_id });
  if (populate === "true") {
    query = query.populate("eventDays.decorItems.decor");
  }
  query
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

module.exports = {
  CreateNew,
  GetAll,
  Get,
  AddEventDay,
  AddDecorInEventDay,
  RemoveDecorInEventDay,
  FinalizeEventDay,
};
