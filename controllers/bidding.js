const Bidding = require("../models/Bidding");
const BiddingBid = require("../models/BiddingBid");
const Vendor = require("../models/Vendor");
const Chat = require("../models/Chat");
const ChatContent = require("../models/ChatContent");

const CreateNew = (req, res) => {
  const { user_id, isAdmin, isVendor } = req.auth;
  const { events, requirements } = req.body;
  if (
    !(events.length > 0 && requirements !== undefined) &&
    !isAdmin &&
    !isVendor
  ) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    new Bidding({
      events,
      requirements,
      user: user_id,
      status: { active: true, finalized: false, lost: false },
    })
      .save()
      .then(async (result) => {
        const { city, gender, category } = requirements;
        const query = {};
        if (gender) {
          query.gender = gender;
        }
        if (city) {
          query["businessAddress.city"] = city;
        }
        if (category) {
          query.category = category;
        }
        query.biddingStatus = true;
        const vendors = await Vendor.find(query);
        await Promise.all(
          vendors.map((item) => {
            new BiddingBid({
              bidding: result?._id,
              vendor: item?._id,
              status: {
                accepted: false,
                rejected: false,
              },
            }).save();
          })
        );
        res.status(201).send({ message: "success", id: result._id });
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const GetAll = (req, res) => {
  const { user_id, isAdmin, isVendor } = req.auth;
  if (isAdmin) {
    Bidding.find({})
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.status(400).send({
          message: "error",
          error,
        });
      });
  } else if (isVendor) {
  } else {
    Bidding.find({ user: user_id })
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
  const { user_id, isAdmin, isVendor } = req.auth;
  if (isAdmin) {
    Bidding.findById({ _id })
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
  } else if (isVendor) {
  } else {
    Bidding.findOne({ _id, user: user_id })
      .then((result) => {
        if (!result) {
          res.status(404).send();
        } else {
          BiddingBid.find({
            bidding: _id,
            "status.accepted": true,
            bid: { $gt: 0 },
          })
            .populate("vendor")
            .then((bids) => {
              res.send({ ...result.toObject(), bids });
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

const UserViewBiddingBid = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id, bidId } = req.params;
  if (!isVendor && !isAdmin) {
    BiddingBid.findOneAndUpdate(
      { _id: bidId, bidding: _id },
      { $set: { "status.userViewed": true } }
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
    res.status(400).send({
      message: "error",
      error: {},
    });
  }
};

const UserAcceptBiddingBid = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id, bidId } = req.params;
  if (!isVendor && !isAdmin) {
    BiddingBid.findOneAndUpdate(
      { _id: bidId, bidding: _id },
      { $set: { "status.userAccepted": true } },
      { new: true }
    )
      .then(async (result) => {
        if (result) {
          let chat = await Chat.findOne({
            user: user_id,
            vendor: result?.vendor,
          });
          if (!chat) {
            chat = await new Chat({
              user: user_id,
              vendor: result?.vendor,
            }).save();
          }
          await new ChatContent({
            chat: chat?._id,
            contentType: "BiddingBid",
            content: result?.bid,
            other: { bidding: _id, biddingBid: bidId },
          }).save();
          res.status(200).send({ message: "success", chat: chat?._id });
        } else {
          res.status(404).send({ message: "not found" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else {
    res.status(400).send({
      message: "error",
      error: {},
    });
  }
};

const UserRejectBiddingBid = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id, bidId } = req.params;
  if (!isVendor && !isAdmin) {
    BiddingBid.findOneAndUpdate(
      { _id: bidId, bidding: _id },
      { $set: { "status.userRejected": true } }
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
    res.status(400).send({
      message: "error",
      error: {},
    });
  }
};

const Update = (req, res) => {
  const { _id } = req.params;
  const { title } = req.body;
  if (!title) {
    res.status(400).send({ message: "Incomplete Data" });
  } else {
    Bidding.findByIdAndUpdate(
      { _id },
      {
        $set: {
          title,
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
};

const Delete = (req, res) => {
  const { _id } = req.params;
  Bidding.findByIdAndDelete({ _id })
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

module.exports = {
  CreateNew,
  GetAll,
  Get,
  Update,
  Delete,
  UserAcceptBiddingBid,
  UserRejectBiddingBid,
  UserViewBiddingBid,
};
