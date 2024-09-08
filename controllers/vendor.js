const Vendor = require("../models/Vendor");
const { createObjectCsvStringifier } = require("csv-writer");
const { CreateNotification } = require("../utils/notification");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { VerifyOTP } = require("../utils/otp");

const CreateNew = (req, res) => {
  const {
    name,
    phone,
    email,
    gender,
    servicesOffered,
    category,
    Otp,
    ReferenceId,
  } = req.body;
  if (
    !name ||
    !phone ||
    !email ||
    !gender ||
    !servicesOffered ||
    !category ||
    phone.length !== 13 ||
    !Otp ||
    !ReferenceId
  ) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    VerifyOTP(phone, ReferenceId, Otp)
      .then((result) => {
        if (result.Valid === true) {
          Vendor.findOne({ phone })
            .then((user) => {
              if (user) {
                res.status(400).send({ message: "Vendor already exists." });
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
                    CreateNotification({
                      title: `New Vendor Added: ${name}`,
                      category: "Vendor",
                      references: { vendor: result._id },
                    });
                    const token = jwt.sign(
                      { _id: result._id, isVendor: true },
                      process.env.JWT_SECRET,
                      jwtConfig
                    );
                    res
                      .status(201)
                      .send({ message: "success", id: result._id, token });
                  })
                  .catch((error) => {
                    res.status(400).send({ message: "error", error });
                  });
              }
            })
            .catch((error) => {
              res.status(400).send({ message: "error", error });
            });
        } else {
          res.status(400).send({ message: "Invalid OTP" });
        }
      })
      .catch((err) => {
        res.status(400).send({ message: "error", error: err });
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
        // PENDING
      } else if (sort === "Newest (Registration)") {
        // sortQuery.createdAt = 1;
        // PENDING
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
  const { user_id, isAdmin, isVendor } = req.auth;
  const { updateKey } = req.query;
  if (isAdmin && _id) {
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
            CreateNotification({
              title: profileVerified
                ? `Vendor Profile marked as Verified`
                : `Vendor Profile marked as not Verified`,
              category: "Vendor",
              references: { vendor: _id },
            });
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
            CreateNotification({
              title: profileVisibility
                ? `Vendor Profile marked as Visible`
                : `Vendor Profile marked as not Visible`,
              category: "Vendor",
              references: { vendor: _id },
            });
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
            CreateNotification({
              title: packageStatus
                ? `Enabled Vendor Package Status`
                : `Disabled Vendor Package Status`,
              category: "Vendor",
              references: { vendor: _id },
            });
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
            CreateNotification({
              title: biddingStatus
                ? `Enabled Vendor Bidding Status`
                : `Disabled Vendor Bidding Status`,
              category: "Vendor",
              references: { vendor: _id },
            });
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
        name,
        tag,
        businessAddress,
        businessName,
        businessDescription,
        servicesOffered,
        speciality,
        other,
      } = req.body;
      if (
        !name &&
        !tag &&
        !businessAddress?.state &&
        !businessAddress?.city &&
        !businessAddress?.area &&
        !businessAddress?.pincode &&
        !businessAddress?.address &&
        !businessAddress?.googleMaps &&
        !businessName &&
        !businessDescription &&
        servicesOffered.length === 0 &&
        !speciality &&
        (other.groomMakeup === undefined || other.groomMakeup === null)
      ) {
        res.status(400).send({ message: "Incomplete Data" });
      } else {
        console.log(tag);

        Vendor.findById(_id)
          .then((vendor) => {
            if (!vendor) {
              res.status(404).send({ message: "Vendor not found" });
            } else {
              const updates = {};
              const notifications = [];
              if (name && name !== vendor.name) {
                updates.name = name;
                notifications.push({
                  title: `Vendor Name Changed: ${vendor.name || ""} to ${name}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (tag && tag !== vendor.tag) {
                updates.tag = tag;
                notifications.push({
                  title: `Vendor Tag Changed: ${vendor.tag || ""} to ${tag}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (speciality && speciality !== vendor.speciality) {
                updates.speciality = speciality;
                notifications.push({
                  title: `Vendor Speciality Changed: ${
                    vendor.speciality || ""
                  } to ${speciality}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                servicesOffered &&
                servicesOffered.length > 0 &&
                JSON.stringify(servicesOffered) !==
                  JSON.stringify(vendor.servicesOffered)
              ) {
                updates.servicesOffered = servicesOffered;
                notifications.push({
                  title: `Vendor Services Offered Changed: ${
                    vendor.servicesOffered.join(", ") || ""
                  } to ${servicesOffered.join(", ")}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                !(
                  other.groomMakeup === undefined || other.groomMakeup === null
                ) &&
                other.groomMakeup !== vendor.other.groomMakeup
              ) {
                updates["other.groomMakeup"] = other.groomMakeup;
                notifications.push({
                  title: `Vendor Groom Makeup Status Changed: ${
                    vendor.other.groomMakeup ? "True" : "False"
                  } to ${other.groomMakeup ? "True" : "False"}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (businessName && businessName !== vendor.businessName) {
                updates.businessName = businessName;
                notifications.push({
                  title: `Vendor Business Name Changed: ${
                    vendor.businessName || ""
                  } to ${businessName}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessDescription &&
                businessDescription !== vendor.businessDescription
              ) {
                updates.businessDescription = businessDescription;
                notifications.push({
                  title: `Vendor Business Description Changed: ${
                    vendor.businessDescription || ""
                  } to ${businessDescription}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.state &&
                businessAddress?.state !== vendor?.businessAddress?.state
              ) {
                updates["businessAddress.state"] = businessAddress?.state;
                notifications.push({
                  title: `Vendor State Changed: ${
                    vendor?.businessAddress?.state || ""
                  } to ${businessAddress?.state}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.city &&
                businessAddress?.city !== vendor?.businessAddress?.city
              ) {
                updates["businessAddress.city"] = businessAddress?.city;
                notifications.push({
                  title: `Vendor City Changed: ${
                    vendor?.businessAddress?.city || ""
                  } to ${businessAddress?.city}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.area &&
                businessAddress?.area !== vendor?.businessAddress?.area
              ) {
                updates["businessAddress.area"] = businessAddress?.area;
                notifications.push({
                  title: `Vendor Area Changed: ${
                    vendor?.businessAddress?.area || ""
                  } to ${businessAddress?.area}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.pincode &&
                businessAddress?.pincode !== vendor?.businessAddress?.pincode
              ) {
                updates["businessAddress.pincode"] = businessAddress?.pincode;
                notifications.push({
                  title: `Vendor Pincode Changed: ${
                    vendor?.businessAddress?.pincode || ""
                  } to ${businessAddress?.pincode}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.address &&
                businessAddress?.address !== vendor?.businessAddress?.address
              ) {
                updates["businessAddress.address"] = businessAddress?.address;
                notifications.push({
                  title: `Vendor Address Changed: ${
                    vendor?.businessAddress?.address || ""
                  } to ${businessAddress?.address}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.googleMaps &&
                businessAddress?.googleMaps !==
                  vendor?.businessAddress?.googleMaps
              ) {
                updates["businessAddress.googleMaps"] =
                  businessAddress?.googleMaps;
                notifications.push({
                  title: `Vendor Google Maps Link Changed: ${
                    vendor?.businessAddress?.googleMaps || ""
                  } to ${businessAddress?.googleMaps}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (Object.keys(updates).length === 0) {
                return res.status(400).send({ message: "No changes detected" });
              }
              Vendor.findByIdAndUpdate(_id, { $set: updates }, { new: true })
                .then((result) => {
                  if (result) {
                    notifications.forEach((notification) =>
                      CreateNotification(notification)
                    );
                    res.status(200).send({ message: "success" });
                  } else {
                    res.status(404).send({ message: "not found" });
                  }
                })
                .catch((error) => {
                  res.status(400).send({ message: "error", error });
                });
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "error", error });
          });
      }
    }
  } else if (isVendor) {
    const {
      name,
      businessAddress,
      businessName,
      businessDescription,
      servicesOffered,
      speciality,
    } = req.body;
    if (
      !name &&
      !businessAddress?.state &&
      !businessAddress?.city &&
      !businessAddress?.area &&
      !businessAddress?.pincode &&
      !businessAddress?.address &&
      !businessAddress?.googleMaps &&
      !businessName &&
      !businessDescription &&
      servicesOffered.length === 0 &&
      !speciality
    ) {
      res.status(400).send({ message: "Incomplete Data" });
    } else {
      Vendor.findById({ _id: user_id })
        .then((vendor) => {
          try {
            if (!vendor) {
              res.status(404).send({ message: "Vendor not found" });
            } else {
              const updates = {};
              const notifications = [];
              if (name && name !== vendor?.name) {
                updates.name = name;
                notifications.push({
                  title: `Vendor Name Changed: ${
                    vendor?.name || ""
                  } to ${name}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (speciality && speciality !== vendor?.speciality) {
                updates.speciality = speciality;
                notifications.push({
                  title: `Vendor Speciality Changed: ${
                    vendor?.speciality || ""
                  } to ${speciality}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                servicesOffered &&
                servicesOffered.length > 0 &&
                JSON.stringify(servicesOffered) !==
                  JSON.stringify(vendor?.servicesOffered)
              ) {
                updates.servicesOffered = servicesOffered;
                notifications.push({
                  title: `Vendor Services Offered Changed: ${
                    vendor?.servicesOffered.join(", ") || ""
                  } to ${servicesOffered.join(", ")}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (businessName && businessName !== vendor?.businessName) {
                updates.businessName = businessName;
                notifications.push({
                  title: `Vendor Business Name Changed: ${
                    vendor?.businessName || ""
                  } to ${businessName}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessDescription &&
                businessDescription !== vendor?.businessDescription
              ) {
                updates.businessDescription = businessDescription;
                notifications.push({
                  title: `Vendor Business Description Changed: ${
                    vendor?.businessDescription || ""
                  } to ${businessDescription}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.state &&
                businessAddress?.state !== vendor?.businessAddress?.state
              ) {
                updates["businessAddress.state"] = businessAddress?.state;
                notifications.push({
                  title: `Vendor State Changed: ${
                    vendor?.businessAddress?.state || ""
                  } to ${businessAddress?.state}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.city &&
                businessAddress?.city !== vendor?.businessAddress?.city
              ) {
                updates["businessAddress.city"] = businessAddress?.city;
                notifications.push({
                  title: `Vendor City Changed: ${
                    vendor?.businessAddress?.city || ""
                  } to ${businessAddress?.city}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.area &&
                businessAddress?.area !== vendor?.businessAddress?.area
              ) {
                updates["businessAddress.area"] = businessAddress?.area;
                notifications.push({
                  title: `Vendor Area Changed: ${
                    vendor?.businessAddress?.area || ""
                  } to ${businessAddress?.area}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.pincode &&
                businessAddress?.pincode !== vendor?.businessAddress?.pincode
              ) {
                updates["businessAddress.pincode"] = businessAddress?.pincode;
                notifications.push({
                  title: `Vendor Pincode Changed: ${
                    vendor?.businessAddress?.pincode || ""
                  } to ${businessAddress?.pincode}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.address &&
                businessAddress?.address !== vendor?.businessAddress?.address
              ) {
                updates["businessAddress.address"] = businessAddress?.address;
                notifications.push({
                  title: `Vendor Address Changed: ${
                    vendor?.businessAddress?.address || ""
                  } to ${businessAddress?.address}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (
                businessAddress?.googleMaps &&
                businessAddress?.googleMaps !==
                  vendor?.businessAddress?.googleMaps
              ) {
                updates["businessAddress.googleMaps"] =
                  businessAddress?.googleMaps;
                notifications.push({
                  title: `Vendor Google Maps Link Changed: ${
                    vendor?.businessAddress?.googleMaps || ""
                  } to ${businessAddress?.googleMaps}`,
                  category: "Vendor",
                  references: { vendor: vendor._id },
                });
              }
              if (Object.keys(updates).length === 0) {
                return res.status(400).send({ message: "No changes detected" });
              }
              Vendor.findByIdAndUpdate(
                { _id: user_id },
                { $set: updates },
                { new: true }
              )
                .then((result) => {
                  if (result) {
                    console.log("Vendor", vendor);
                    notifications.forEach((notification) =>
                      CreateNotification(notification)
                    );
                    res.status(200).send({ message: "success" });
                  } else {
                    res.status(404).send({ message: "not found" });
                  }
                })
                .catch((error) => {
                  res.status(400).send({ message: "error", error });
                });
            }
          } catch (error) {
            res.status(400).send({ message: "error", error });
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

const AddNotes = (req, res) => {
  const { _id } = req.params;
  const { text } = req.body;
  Vendor.findByIdAndUpdate(
    { _id },
    { $addToSet: { notes: { text, createdAt: Date.now() } } }
  )
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

module.exports = {
  CreateNew,
  GetAll,
  Get,
  Update,
  Delete,
  DeleteVendors,
  AddNotes,
};
