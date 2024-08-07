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
  const { category } = req.query;
  const query = {};
  if (category) {
    query.category = category;
  }
  Notification.find(query)
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

module.exports = { CreateNew, GetAll };
