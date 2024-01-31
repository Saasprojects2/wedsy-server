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

const Update = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  const { name, community } = req.body;
  if (!name || !community) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      { _id, user: user_id },
      {
        name,
        community,
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

const AddEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  const { name, date, time, venue } = req.body;
  if (!name || !date || !time || !venue) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
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
const UpdateEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, eventDay } = req.params;
  const { name, date, time, venue } = req.body;
  if (!name || !date || !time || !venue || !eventDay) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      { _id, user: user_id, "eventDays._id": eventDay },
      {
        $set: {
          "eventDays.$.name": name,
          "eventDays.$.date": date,
          "eventDays.$.time": time,
          "eventDays.$.venue": venue,
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

const UpdateNotes = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, eventDay } = req.params;
  const { user, decor_id, package_id, admin_notes, user_notes } = req.body;
  if (!decor_id && !package_id) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    if (decor_id) {
      Event.updateOne(
        {
          _id,
          user: isAdmin ? user : user_id,
          "eventDays._id": eventDay,
        },
        {
          $set: isAdmin
            ? {
                "eventDays.$[].decorItems.$[x].admin_notes": admin_notes,
              }
            : {
                "eventDays.$[].decorItems.$[x].user_notes": user_notes,
              },
        },
        { arrayFilters: [{ "x.decor": decor_id }] }
      )
        .then((result) => {
          if (result) {
            res.status(200).send({ message: "success" });
          }
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    } else if (package_id) {
      Event.updateOne(
        {
          _id,
          user: isAdmin ? user : user_id,
          "eventDays._id": eventDay,
        },
        {
          $set: isAdmin
            ? {
                "eventDays.$[].packages.$[x].admin_notes": admin_notes,
              }
            : {
                "eventDays.$[].packages.$[x].user_notes": user_notes,
              },
        },
        { arrayFilters: [{ "x.package": package_id }] }
      )
        .then((result) => {
          if (result) {
            res.status(200).send({ message: "success" });
          }
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    }
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

const AddDecorPackageInEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  const { package, price, variant, decorItems } = req.body;
  if (!package || !variant || !price) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
      {
        $addToSet: {
          "eventDays.$.packages": {
            package,
            price,
            variant,
            decorItems,
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

const RemoveDecorPackageInEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  const { package } = req.body;
  if (!package) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
      {
        $pull: {
          "eventDays.$.packages": {
            package,
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

const GetAll = async (req, res) => {
  const { user_id, isAdmin } = req.auth;
  if (isAdmin) {
    if (req.query.stats === "upcoming") {
      //
    } else if (req.query.stats === "pending_approval") {
      // Aggregate to count finalized event days
      const result = await Event.aggregate([
        // { $unwind: "$eventdays" }, // Split the array into separate documents
        // // { $match: { "status.finalized": true } }, // Filter documents with status "finalized"
        // { $group: { _id: null, count: { $sum: 1 } } }, // Count the matching documents
        {
          $project: {
            count: {
              $size: {
                $filter: {
                  input: "$eventDays",
                  cond: { $eq: ["$$this.status.finalized", true] },
                },
              },
            },
          },
        },
        { $group: { _id: null, count: { $sum: "$count" } } },
      ]);
      // Extract the count from the result
      const count = result.length > 0 ? result[0].count : 0;
      res.send({ pending_approval: count });
    }
  } else {
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
  }
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
    query = query.populate(
      "eventDays.decorItems.decor eventDays.packages.package eventDays.packages.decorItems.decor"
    );
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
  Update,
  GetAll,
  Get,
  AddEventDay,
  AddDecorInEventDay,
  RemoveDecorInEventDay,
  AddDecorPackageInEventDay,
  RemoveDecorPackageInEventDay,
  FinalizeEventDay,
  UpdateEventDay,
  UpdateNotes,
};
