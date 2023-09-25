const Decor = require("../models/Decor");

const CreateNew = (req, res) => {
  const {
    category,
    label,
    name,
    unit,
    tags,
    image,
    thumbnail,
    video,
    description,
    pdf,
    productVariation,
    productInfo,
    seoTags,
  } = req.body;
  if (!name || !category) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    new Decor({
      category,
      label,
      name,
      unit,
      tags,
      image,
      thumbnail,
      video,
      description,
      pdf,
      productVariation,
      productInfo,
      seoTags,
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
  const skip = (page - 1) * limit;
  Decor.find({})
    .skip(skip)
    .limit(limit)
    .exec()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

const Get = (req, res) => {
  const { _id } = req.params;
  Decor.findById({ _id })
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

module.exports = { CreateNew, GetAll, Get };
