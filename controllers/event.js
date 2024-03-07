const Event = require("../models/Event");
const { SendUpdate } = require("../utils/update");

const CreateNew = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { name, community, eventDay, date, time, venue, user } = req.body;
  if (!name || !community || !eventDay || !date || !time || !venue) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    new Event({
      user: isAdmin ? user : user_id,
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
  const { user_id, isAdmin } = req.auth;
  const { _id } = req.params;
  const { name, community } = req.body;
  if (!name || !community) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(isAdmin ? { _id } : { _id, user: user_id }, {
      name,
      community,
    })
      .then((result) => {
        res.status(200).send({ message: "success" });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const AddEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id } = req.params;
  const { name, date, time, venue } = req.body;
  if (!name || !date || !time || !venue) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(isAdmin ? { _id } : { _id, user: user_id }, {
      $addToSet: {
        eventDays: {
          name,
          date,
          time,
          venue,
          decorItems: [],
          status: {
            finalized: false,
            approved: false,
            paymentDone: false,
            completed: false,
          },
        },
      },
    })
      .then((result) => {
        res.status(200).send({ message: "success" });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};
const UpdateEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, eventDay } = req.params;
  const { name, date, time, venue } = req.body;
  if (!name || !date || !time || !venue || !eventDay) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      isAdmin
        ? { _id, "eventDays._id": eventDay }
        : { _id, user: user_id, "eventDays._id": eventDay },
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

const DeleteEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, eventDay } = req.params;
  Event.findOneAndUpdate(
    isAdmin
      ? { _id, "eventDays._id": eventDay, "status.approved": false }
      : {
          _id,
          user: user_id,
          "eventDays._id": eventDay,
          "status.finalized": false,
        },
    {
      $pull: {
        eventDays: { _id: eventDay },
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

const UpdateNotes = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, eventDay } = req.params;
  const { user, decor_id, package_id, admin_notes, user_notes } = req.body;
  if (!decor_id && !package_id) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    if (decor_id) {
      Event.updateOne(
        isAdmin
          ? { _id, "eventDays._id": eventDay }
          : {
              _id,
              user: user_id,
              "eventDays._id": eventDay,
            },
        {
          $set: isAdmin
            ? {
                "eventDays.$[].decorItems.$[x].admin_notes": admin_notes,
                "eventDays.$[].decorItems.$[x].user_notes": user_notes,
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
          } else {
            res.status(404).send({ message: "Event not found" });
          }
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    } else if (package_id) {
      Event.updateOne(
        isAdmin
          ? { _id, "eventDays._id": eventDay }
          : {
              _id,
              user: user_id,
              "eventDays._id": eventDay,
            },
        {
          $set: isAdmin
            ? {
                "eventDays.$[].packages.$[x].admin_notes": admin_notes,
                "eventDays.$[].packages.$[x].user_notes": user_notes,
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
          } else {
            res.status(404).send({ message: "Event not found" });
          }
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    }
  }
};

const UpdateCustomItemsInEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, dayId } = req.params;
  const { customItems } = req.body;
  if (customItems === undefined || customItems === null) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      isAdmin
        ? { _id, eventDays: { $elemMatch: { _id: dayId } } }
        : { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
      {
        $set: {
          "eventDays.$.customItems": customItems,
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

const UpdateMandatoryItemsInEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, dayId } = req.params;
  const { mandatoryItems } = req.body;
  if (mandatoryItems === undefined || mandatoryItems === null) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      isAdmin
        ? { _id, eventDays: { $elemMatch: { _id: dayId } } }
        : { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
      {
        $set: {
          "eventDays.$.mandatoryItems": mandatoryItems,
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

const AddDecorInEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
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
      isAdmin
        ? { _id, eventDays: { $elemMatch: { _id: dayId } } }
        : { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
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

const EditDecorAddOnsInEventDay = (req, res) => {
  const { user_id, isAdmin } = req.auth;
  const { _id, dayId } = req.params;
  const { decor_id, addOns, price } = req.body;
  if (!decor_id || addOns === undefined) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      isAdmin
        ? { _id, "eventDays._id": dayId }
        : { _id, user: user_id, "eventDays._id": dayId },
      {
        $set: {
          "eventDays.$[].decorItems.$[x].addOns": addOns,
          "eventDays.$[].decorItems.$[x].price": price,
        },
      },
      { arrayFilters: [{ "x.decor": decor_id }] }
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
  const { user_id, isAdmin } = req.auth;
  const { _id, dayId } = req.params;
  const { decor } = req.body;
  if (!decor) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      isAdmin
        ? { _id, eventDays: { $elemMatch: { _id: dayId } } }
        : { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
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
  const { user_id, isAdmin } = req.auth;
  const { _id, dayId } = req.params;
  const { package } = req.body;
  if (!package) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Event.findOneAndUpdate(
      isAdmin
        ? { _id, eventDays: { $elemMatch: { _id: dayId } } }
        : { _id, user: user_id, eventDays: { $elemMatch: { _id: dayId } } },
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
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { search, sort, status } = req.query;
      const query = {};
      const sortQuery = {};
      if (search) {
        query.$or = [{ name: { $regex: new RegExp(search, "i") } }];
      }
      if (status) {
        if (status === "Finalized") {
          query["status.finalized"] = true;
          query["status.approved"] = false;
          query["status.paymentDone"] = false;
          query["status.completed"] = false;
        } else if (status === "Approved") {
          query["status.finalized"] = true;
          query["status.approved"] = true;
          query["status.paymentDone"] = false;
          query["status.completed"] = false;
        } else if (status === "Payment Done") {
          query["status.finalized"] = true;
          query["status.approved"] = true;
          query["status.paymentDone"] = true;
          query["status.completed"] = false;
        } else if (status === "Completed") {
          query["status.finalized"] = true;
          query["status.approved"] = true;
          query["status.paymentDone"] = true;
          query["status.completed"] = true;
        }
      }
      if (sort) {
        if (sort === "Newest (Creation)") {
          sortQuery.createdAt = -1;
        } else if (sort === "Older (Creation)") {
          sortQuery.createdAt = 1;
        }
      } else {
        sortQuery.createdAt = 1;
      }
      Event.countDocuments(query)
        .then((total) => {
          const totalPages = Math.ceil(total / limit);
          const skip = (page - 1) * limit;
          Event.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate(
              "user eventDays.decorItems.decor eventDays.packages.package eventDays.packages.decorItems.decor"
            )
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

const FinalizeEvent = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  Event.findOne({
    _id,
    user: user_id,
    "status.finalized": false,
    "status.approved": false,
  })
    .then((event) => {
      if (event?._id) {
        let summary = event.eventDays.map((tempEventDay) => {
          let tempDecorItems = tempEventDay?.decorItems.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempPackages = tempEventDay?.packages.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempCustomItems = tempEventDay?.customItems.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempMandatoryItems = tempEventDay?.mandatoryItems.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempTotal =
            tempDecorItems +
            tempPackages +
            tempCustomItems +
            tempMandatoryItems;
          return {
            eventDayId: tempEventDay._id,
            decorItems: tempDecorItems,
            packages: tempPackages,
            customItems: tempCustomItems,
            mandatoryItems: tempMandatoryItems,
            total: tempTotal,
            costPrice: 0,
            sellingPrice: tempTotal,
          };
        });
        let finalTotal = summary.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.total;
        }, 0);
        Event.findOneAndUpdate(
          {
            _id,
            user: user_id,
            "status.finalized": false,
            "status.approved": false,
          },
          {
            $set: {
              amount: {
                total: finalTotal,
                due: finalTotal,
                paid: 0,
                discount: 0,
                preTotal: finalTotal,
                costPrice: 0,
                sellingPrice: finalTotal,
                summary,
              },
              "status.finalized": true,
              "eventDays.$[elem].status.finalized": true,
            },
          },
          {
            arrayFilters: [
              { "elem._id": { $in: summary.map((i) => i.eventDayId) } },
            ],
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
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const ApproveEventDay = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  Event.findOneAndUpdate(
    {
      _id,
      "status.finalized": true,
      "status.approved": false,
      eventDays: { $elemMatch: { _id: dayId, "status.finalized": true } },
    },
    {
      $set: {
        "eventDays.$.status.approved": true,
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

const RemoveEventDayApproval = (req, res) => {
  const { user_id } = req.auth;
  const { _id, dayId } = req.params;
  Event.findOneAndUpdate(
    {
      _id,
      "status.finalized": true,
      "status.approved": false,
      eventDays: {
        $elemMatch: {
          _id: dayId,
          "status.finalized": true,
          "status.approved": true,
        },
      },
    },
    {
      $set: {
        "eventDays.$.status.approved": false,
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

const ApproveEvent = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  const { discount } = req.body;
  Event.findOne({ _id, "status.finalized": true, "status.approved": false })
    .populate("user")
    .exec()
    .then((event) => {
      if (event._id) {
        let summary = event.eventDays.map((tempEventDay) => {
          let tempDecorItems = tempEventDay?.decorItems.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempPackages = tempEventDay?.packages.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempCustomItems = tempEventDay?.customItems.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempMandatoryItems = tempEventDay?.mandatoryItems.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue.price;
            },
            0
          );
          let tempTotal =
            tempDecorItems +
            tempPackages +
            tempCustomItems +
            tempMandatoryItems;
          return {
            eventDayId: tempEventDay._id,
            decorItems: tempDecorItems,
            packages: tempPackages,
            customItems: tempCustomItems,
            mandatoryItems: tempMandatoryItems,
            total: tempTotal,
            costPrice: 0,
            sellingPrice: tempTotal,
          };
        });
        let finalPreTotal = summary.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.total;
        }, 0);
        const tempDiscount = discount || 0;
        let finalTotal = finalPreTotal - tempDiscount;
        Event.findOneAndUpdate(
          { _id, "status.finalized": true, "status.approved": false },
          {
            $set: {
              amount: {
                total: finalTotal,
                due: finalTotal,
                paid: 0,
                discount: tempDiscount,
                preTotal: finalPreTotal,
                costPrice: 0,
                sellingPrice: finalTotal,
                summary,
              },
              "status.approved": true,
              "eventDays.$[elem].status.approved": true,
            },
          },
          {
            arrayFilters: [
              { "elem._id": { $in: summary.map((i) => i.eventDayId) } },
            ],
          }
        )
          .then((result) => {
            if (result) {
              SendUpdate({
                channels: ["Whatsapp"],
                message: "Event Approved",
                parameters: {
                  name: event?.user?.name,
                  phone: event?.user?.phone,
                },
              });
              res.status(200).send({ message: "success" });
            } else {
              res.status(404).send({ message: "Event not found" });
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const RemoveEventApproval = (req, res) => {
  const { user_id } = req.auth;
  const { _id } = req.params;
  Event.findOneAndUpdate(
    { _id, "status.finalized": true, "status.approved": true },
    {
      $set: {
        "status.approved": false,
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
  const { user_id, isAdmin } = req.auth;
  const { _id } = req.params;
  const { populate, display } = req.query;
  let query = Event.findById(
    isAdmin || display == "true" ? { _id } : { _id, user: user_id }
  );
  if (populate === "true") {
    query = query.populate(
      isAdmin
        ? "eventDays.decorItems.decor eventDays.packages.package eventDays.packages.decorItems.decor user"
        : "eventDays.decorItems.decor eventDays.packages.package eventDays.packages.decorItems.decor"
    );
  }
  query
    .then((result) => {
      if (!result) {
        res.status(404).send();
      } else {
        if (display == "true" && !isAdmin) {
          res.send({
            ...result.toObject(),
            userAccess: user_id == result.user,
          });
        } else {
          res.send(result);
        }
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const SendEventToClient = (req, res) => {
  const { _id } = req.params;
  // Event.findOne({ _id, "status.finalized": true, "status.approved": false })
  Event.findOne({ _id })
    .populate("user")
    .exec()
    .then((event) => {
      if (event._id) {
        SendUpdate({
          channels: ["Whatsapp"],
          message: "Event Planner",
          parameters: {
            name: event?.user?.name,
            phone: event?.user?.phone,
            link: `https://wedsy.in/event/${event?._id}/view`,
          },
        });
        res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "Event not found" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const SendEventBookingReminder = (req, res) => {
  const { _id } = req.params;
  // Event.findOne({ _id, "status.finalized": true, "status.approved": false })
  Event.findOne({ _id })
    .populate("user")
    .exec()
    .then((event) => {
      if (event._id) {
        SendUpdate({
          channels: ["Whatsapp"],
          message: "Booking Reminder",
          parameters: {
            name: event?.user?.name,
            phone: event?.user?.phone,
          },
        });
        res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "Event not found" });
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
  EditDecorAddOnsInEventDay,
  RemoveDecorInEventDay,
  AddDecorPackageInEventDay,
  RemoveDecorPackageInEventDay,
  FinalizeEventDay,
  FinalizeEvent,
  UpdateEventDay,
  DeleteEventDay,
  UpdateNotes,
  UpdateCustomItemsInEventDay,
  UpdateMandatoryItemsInEventDay,
  ApproveEvent,
  RemoveEventApproval,
  RemoveEventDayApproval,
  ApproveEventDay,
  SendEventToClient,
  SendEventBookingReminder,
};
