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
        res.status(201).send({ message: "success", id: result._id });
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
    stageLengthLower,
    stageLengthHigher,
    stageWidthLower,
    stageWidthHigher,
    stageHeightLower,
    stageHeightHigher,
    priceLower,
    priceHigher,
    checkId,
    label,
    spotlight,
    searchFor,
    decorId,
    random,
    similarDecorFor,
    repeat,
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
  } else if (searchFor === "decorId") {
    Decor.find({ "productInfo.id": { $regex: new RegExp(decorId, "i") } })
      .limit(limit)
      .exec()
      .then((result) => {
        res.send({ list: result });
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else if (spotlight === "true" && random === "true") {
    Decor.aggregate([{ $match: { spotlight: true } }, { $sample: { size: 1 } }])
      .then((result) => {
        res.send({ decor: result[0] });
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else if (spotlight === "true" && random === "false") {
    Decor.find({ spotlight: true })
      .then((result) => {
        res.send({ list: result });
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else if (similarDecorFor) {
    Decor.aggregate([
      {
        $match: {
          _id: { $ne: similarDecorFor }, // Exclude the given product
        },
      },
      // {
      //   $project: {
      //     _id: 1,
      //     category: 1,
      //     tags: 1,
      //     occassion: "$productVariation.occassion",
      //     flowers: "$productVariation.flowers",
      //   },
      // },
      // {
      //   $group: {
      //     _id: null,
      //     products: {
      //       $push: {
      //         _id: "$_id",
      //         category: "$category",
      //         tags: "$tags",
      //         occassion: "$occassion",
      //         flowers: "$flowers",
      //       },
      //     },
      //   },
      // },
      // { $unwind: "$products" }, // Unwind to flatten the array
      // { $replaceRoot: { newRoot: "$products" } },
      // { $limit: 10 },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 1,
          category: 1,
          tags: 1,
          "productVariation.occassion": 1,
          "productVariation.flowers": 1,
        },
      },
      { $limit: 10 },
    ])
      .then((result) => {
        Decor.find({ _id: { $in: result.map((item) => item._id) } })
          .then((result) => res.send({ list: result }))
          .catch((error) => res.status(400).send({ message: "error", error }));
      })
      .catch((error) => res.status(400).send({ message: "error", error }));
  } else {
    const query = {};
    const sortQuery = {};
    if (label) {
      query.label = label;
    }
    if (spotlight === "true") {
      query.spotlight = true;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        // { description: { $regex: new RegExp(search, "i") } },
        { tags: { $regex: new RegExp(search, "i") } },
        { "productInfo.included": { $regex: new RegExp(search, "i") } },
        { "productInfo.id": { $regex: new RegExp(search, "i") } },
      ];
    }
    // Stage Size Filters
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
    if (stageLengthLower && stageLengthHigher) {
      query["productInfo.measurements.length"] = {
        $gte: parseInt(stageLengthLower),
        $lte: parseInt(stageLengthHigher),
      };
    }
    if (stageWidthLower && stageWidthHigher) {
      query["productInfo.measurements.width"] = {
        $gte: parseInt(stageWidthLower),
        $lte: parseInt(stageWidthHigher),
      };
    }
    if (stageHeightLower && stageHeightHigher) {
      query["productInfo.measurements.height"] = {
        $gte: parseInt(stageHeightLower),
        $lte: parseInt(stageHeightHigher),
      };
    }
    if (occassion) {
      query["productVariation.occassion"] = {
        $in: occassion.split("|").map((i) => new RegExp(i, "i")),
      };
    }
    if (color) {
      query["productVariation.colors"] = {
        $in: color.split("|").map((i) => new RegExp(i, "i")),
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
        let skip = 0;
        if (repeat === "false") {
          skip =
            page === 0 || page === null || page === undefined
              ? 0
              : (page - 1) * limit;
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
        } else {
          skip =
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
        }
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

const Update = (req, res) => {
  const { _id } = req.params;
  const { addTo, removeFrom } = req.query;
  if (addTo === "spotlight") {
    const { spotlightColor } = req.body;
    Decor.findByIdAndUpdate(
      { _id },
      {
        $set: {
          spotlight: true,
          spotlightColor,
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else if (removeFrom === "spotlight") {
    Decor.findByIdAndUpdate(
      { _id },
      {
        $set: {
          spotlight: false,
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else if (addTo === "bestSeller" || addTo === "popular") {
    Decor.findByIdAndUpdate(
      { _id },
      {
        $set: {
          label: addTo,
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else if (removeFrom === "bestSeller" || removeFrom === "popular") {
    Decor.findByIdAndUpdate(
      { _id },
      {
        $set: {
          label: "",
        },
      }
    )
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
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
      Decor.findByIdAndUpdate(
        { _id },
        {
          $set: {
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
          },
        }
      )
        .then((result) => {
          if (result) {
            res.status(200).send({ message: "success" });
          } else {
            res.status(404).send({ message: "not found" });
          }
        })
        .catch((error) => {
          res.status(400).send({ message: "error", error });
        });
    }
  }
};

const Delete = (req, res) => {
  const { _id } = req.params;
  Decor.findByIdAndDelete({ _id })
    .then((result) => {
      if (result) {
        res.status(200).send({ message: "success" });
      } else {
        res.status(404).send({ message: "not found" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

module.exports = { CreateNew, GetAll, Get, Update, Delete };
