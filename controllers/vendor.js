const Vendor = require("../models/Vendor");
const { createObjectCsvStringifier } = require("csv-writer");

const CreateNew = (req, res) => {
  const { name, phone, email, gender, servicesOffered, category } = req.body;
  if (!name || !phone || !email || !gender || !servicesOffered || !category) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    new Vendor({
      name,
      phone,
      email,
      gender,
      servicesOffered,
      category,
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
  const { user_id, isAdmin } = req.auth;
  if (isAdmin) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const {
      search,
      sort,
      tag,
      state,
      city,
      area,
      pincode,
      profileVerified,
      profileVisibility,
      packageStatus,
      biddingStatus,
      servicesOffered,
      startDate,
      endDate,
      registrationDate,
      download,
    } = req.query;
    const query = {};
    const sortQuery = {};
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { phone: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { city: { $regex: new RegExp(search, "i") } },
      ];
    }
    if (tag) {
      query.tags = tag;
    }
    if (state) {
      query["businessAddress.state"] = state;
    }
    if (city) {
      query["businessAddress.city"] = city;
    }
    if (area) {
      query["businessAddress.area"] = area;
    }
    if (pincode) {
      query["businessAddress.pincode"] = pincode;
    }
    if (servicesOffered && servicesOffered !== "Both") {
      query.servicesOffered = servicesOffered;
    }
    if (profileVerified === "true") {
      query.profileVerified = true;
    } else if (profileVerified === "false") {
      query.profileVerified = false;
    }
    if (profileVisibility === "true") {
      query.profileVisibility = true;
    } else if (profileVisibility === "false") {
      query.profileVisibility = false;
    }
    if (packageStatus === "true") {
      query.packageStatus = true;
    } else if (packageStatus === "false") {
      query.packageStatus = false;
    }
    if (biddingStatus === "true") {
      query.biddingStatus = true;
    } else if (biddingStatus === "false") {
      query.biddingStatus = false;
    }
    if (registrationDate) {
      const filterDate = new Date(registrationDate);
      const startFilterDate = new Date(filterDate.setHours(0, 0, 0, 0));
      const endFilterDate = new Date(filterDate.setHours(23, 59, 59, 999));
      query["registrationDate"] = {
        $gte: startFilterDate,
        $lt: endFilterDate,
      };
    }
    if (startDate && endDate) {
      const startFilterDate = new Date(
        new Date(startDate).setHours(0, 0, 0, 0)
      );
      const endFilterDate = new Date(
        new Date(endDate).setHours(23, 59, 59, 999)
      );
      query["registrationDate"] = {
        $gte: startFilterDate,
        $lt: endFilterDate,
      };
    }
    if (sort) {
      if (sort === "Orders (Highest to Lowest)") {
        // sortQuery.createdAt = -1;
      } else if (sort === "Newest (Registration)") {
        // sortQuery.createdAt = 1;
      } else if (sort === "Newest (Registration)") {
        sortQuery.registrationDate = -1;
      } else if (sort === "Older (Registration)") {
        sortQuery.registrationDate = 1;
      } else if (sort === "Alphabetical Order") {
        sortQuery["name"] = -1;
      }
    } else {
      sortQuery.createdAt = -1;
    }
    if (download === "csv") {
      Vendor.find(query)
        .sort(sortQuery)
        .populate("")
        .lean()
        .exec()
        .then((result) => {
          try {
            const csvStringifier = createObjectCsvStringifier({
              header: [{ id: "name", title: "Name" }],
            });
            const header = csvStringifier.getHeaderString();
            const records = csvStringifier.stringifyRecords(result);
            const csvData = header + records;
            res.setHeader(
              "Content-disposition",
              "attachment; filename=vendors.csv"
            );
            res.set("Content-Type", "text/csv");
            res.status(200).send(csvData);
          } catch (error) {
            console.error("Error fetching data and creating CSV:", error);
            res.status(500).send("Internal Server Error");
          }
        })
        .catch((error) => {
          res.status(400).send({
            message: "error",
            error,
          });
        });
    } else {
      Vendor.countDocuments(query)
        .then((total) => {
          const totalPages = Math.ceil(total / limit);
          const skip = (page - 1) * limit;
          Vendor.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate("")
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
    Vendor.find({})
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

const Get = (req, res) => {
  const { _id } = req.params;
  Vendor.findById({ _id })
    .then((result) => {
      if (!result) {
        res.status(404).send();
      } else {
        res.send(result);
      }
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

const Update = (req, res) => {
  const { _id } = req.params;
  const { user_id, isAdmin } = req.auth;
  const { updateKey } = req.query;
  if (isAdmin) {
    if (updateKey && updateKey === "profileVerified") {
      const { profileVerified } = req.body;
      Vendor.findByIdAndUpdate(
        { _id },
        {
          $set: {
            profileVerified,
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
    } else if (updateKey && updateKey === "profileVisibility") {
      const { profileVisibility } = req.body;
      Vendor.findOneAndUpdate(
        { _id, profileVerified: true },
        {
          $set: {
            profileVisibility,
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
    } else if (updateKey && updateKey === "packageStatus") {
      const { packageStatus } = req.body;
      Vendor.findOneAndUpdate(
        { _id, profileVerified: true },
        {
          $set: {
            packageStatus,
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
    } else if (updateKey && updateKey === "biddingStatus") {
      const { biddingStatus } = req.body;
      Vendor.findOneAndUpdate(
        { _id, profileVerified: true },
        {
          $set: {
            biddingStatus,
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
  } else {
    const { name } = req.body;
    if (!name) {
      res.status(400).send({ message: "Incomplete Data" });
    } else {
      Vendor.findByIdAndUpdate(
        { _id },
        {
          $set: {
            name,
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
  Vendor.findByIdAndDelete({ _id })
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

const DeleteVendors = (req, res) => {
  const { vendorIds } = req.body;
  Vendor.deleteMany({ _id: { $in: vendorIds } })
    .then((result) => {
      if (!result) {
        res.status(404).send();
      } else {
        res.send({ message: "success" });
      }
    })
    .catch((error) => {
      res.status(400).send({ message: "error", error });
    });
};

module.exports = { CreateNew, GetAll, Get, Update, Delete, DeleteVendors };
