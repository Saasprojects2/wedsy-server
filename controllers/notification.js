const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const CreateNew = (req, res) => {
  const { category, title, references } = req.body;
  if (!category || !title) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    new Notification({
      category,
      title,
      references,
    })
      .save()
      .then((result) => {
        res.status(201).send({ message: "success", id: result._id });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const GetAll = (req, res) => {
  const { category, vendor, date, startDate, endDate } = req.query;
  const query = {};
  if (category) {
    query.category = category;
  }
  if (vendor) {
    query["references.vendor"] = {
      $in: [vendor, new mongoose.Types.ObjectId(vendor)],
    };
  }
  if (date) {
    const filterDate = new Date(date);
    const startFilterDate = new Date(filterDate.setHours(0, 0, 0, 0));
    const endFilterDate = new Date(filterDate.setHours(23, 59, 59, 999));
    query["createdAt"] = {
      $gte: startFilterDate,
      $lt: endFilterDate,
    };
  }
  if (startDate && endDate) {
    const startFilterDate = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const endFilterDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    query["createdAt"] = {
      $gte: startFilterDate,
      $lt: endFilterDate,
    };
  }
  Notification.find(query)
    .sort({ createdAt: -1 })
    .then((result) => {
      res.send({ list: result });
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

module.exports = { CreateNew, GetAll };
