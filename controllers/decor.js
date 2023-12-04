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
  const {
    category,
    occassion,
    color,
    style,
    search,
    sort,
    stageSizeLower,
    stageSizeHigher,
    priceLower,
    priceHigher,
    checkId,
  } = req.query;
  if (checkId) {
    Decor.find({ "productInfo.id": checkId })
      .then((result) => {
        res.send({ id: checkId, isValid: !Boolean(result.length) });
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else {
    const query = {};
    const sortQuery = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { tags: { $regex: new RegExp(search, "i") } },
        { "productInfo.includes": { $regex: new RegExp(search, "i") } },
      ];
    }
    if (!stageSizeLower && stageSizeHigher) {
      query.$expr = {
        $and: [
          {
            $gte: [
              {
                $multiply: [
                  "$productInfo.measurements.length",
                  "$productInfo.measurements.width",
                ],
              },
              stageSizeLower,
            ],
          },
          {
            $lte: [
              {
                $multiply: [
                  "$productInfo.measurements.length",
                  "$productInfo.measurements.width",
                ],
              },
              stageSizeHigher,
            ],
          },
        ],
      };
    }
    if (occassion) {
      query["productVariation.occassion"] = { $in: occassion.split("|") };
    }
    if (color) {
      query["productVariation.colors"] = {
        $in: color.split("|").map((i) => i.toLowerCase()),
      };
    }
    if (style && style !== "Both") {
      query["productVariation.style"] = style;
    }
    if (priceLower && priceHigher) {
      query["productInfo.variant.artificialFlowers.sellingPrice"] = {
        $gte: priceLower,
        $lte: priceHigher,
      };
      query["productInfo.variant.mixedFlowers.sellingPrice"] = {
        $gte: priceLower,
        $lte: priceHigher,
      };
      query["productInfo.variant.naturalFlowers.sellingPrice"] = {
        $gte: priceLower,
        $lte: priceHigher,
      };
      // } else if (priceLower) {
      //   query["productInfo.sellingPrice"] = { $gte: priceLower };
      // } else if (priceHigher) {
      //   query["productInfo.sellingPrice"] = { $lte: priceHigher };
    }
    if (sort) {
      if (sort === "Price:Low-to-High") {
        sortQuery["productInfo.variant.artificialFlowers.sellingPrice"] = 1;
      } else if (sort === "Price:High-to-Low") {
        sortQuery["productInfo.variant.artificialFlowers.sellingPrice"] = -1;
      }
    }

    Decor.countDocuments(query)
      .then((total) => {
        const totalPages = Math.ceil(total / limit);
        const validPage = page % totalPages;
        const skip =
          validPage === 0 || validPage === null || validPage === undefined
            ? 0
            : (validPage - 1) * limit;
        Decor.find(query)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
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
