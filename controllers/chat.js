const Chat = require("../models/Chat");
const ChatContent = require("../models/ChatContent");

// const CreateNew = (req, res) => {
//   const { title } = req.body;
//   if (!title) {
//     res.status(400).send({ message: "Incomplete Data" });
//   } else {
//     new Chat({
//       title,
//     })
//       .save()
//       .then((result) => {
//         res.status(201).send({ message: "success", id: result._id });
//       })
//       .catch((error) => {
//         res.status(400).send({ message: "error", error });
//       });
//   }
// };

const GetAll = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const query = {};
  let populate = "";
  if (isVendor) {
    query.vendor = user_id;
    populate = "user";
  } else if (!isAdmin) {
    query.user = user_id;
    populate = "vendor";
  } else {
    populate = "vendor user";
  }
  Chat.find(query)
    .populate(populate)
    .then(async (chats) => {
      const chatsWithLastMessage = await Promise.all(
        chats.map(async (chat) => {
          const lastMessage = await ChatContent.findOne({ chat: chat._id })
            .sort({ createdAt: -1 })
            .limit(1);
          const unreadCount = await ChatContent.countDocuments({
            chat: chat._id,
            $or: [
              { "status.viewedByUser": false },
              { "status.viewedByVendor": false },
            ],
          });
          return {
            ...chat.toObject(),
            lastMessage: lastMessage || null,
            unreadCount: unreadCount,
          };
        })
      );
      res.send(chatsWithLastMessage);
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

const Get = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  const { read } = req.query;
  const query = { _id };
  const update = { chat: _id };
  let populate = "";
  if (isVendor) {
    query.vendor = user_id;
    populate = "user";
    update["status.viewedByVendor"] = true;
  } else if (!isAdmin) {
    query.user = user_id;
    populate = "vendor";
    update["status.viewedByUser"] = true;
  }
  Chat.findOne(query)
    .populate(populate)
    .then(async (chat) => {
      const messages = await ChatContent.find({ chat: chat._id }).sort({
        createdAt: -1,
      });
      if (read === "true") {
        await ChatContent.updateMany(update);
      }
      res.send({
        ...chat.toObject(),
        messages: messages || [],
      });
    })
    .catch((error) => {
      res.status(400).send({
        message: "error",
        error,
      });
    });
};

const CreateNewChatContent = (req, res) => {
  const { user_id, isVendor, isAdmin } = req.auth;
  const { _id } = req.params;
  const { contentType, content, other } = req.body;
  if (contentType === "Text" && content) {
    new ChatContent({
      chat: _id,
      contentType,
      content,
      sender: {
        id: user_id,
        role: isVendor ? "vendor" : isAdmin ? "admin" : "user",
      },
      status: {
        viewedByUser: !isVendor && !isAdmin,
        viewedByVendor: isVendor,
      },
    })
      .save()
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "error" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  } else if (contentType === "BiddingOffer") {
    new ChatContent({
      chat: _id,
      contentType,
      content,
      other,
      sender: {
        id: user_id,
        role: isVendor ? "vendor" : isAdmin ? "admin" : "user",
      },
      status: {
        viewedByUser: !isVendor && !isAdmin,
        viewedByVendor: isVendor,
      },
    })
      .save()
      .then((result) => {
        if (result) {
          res.status(200).send({ message: "success" });
        } else {
          res.status(404).send({ message: "error" });
        }
      })
      .catch((error) => {
        res.status(400).send({ message: "error", error });
      });
  }
};

const UpdateChatContent = (req, res) => {
  const { _id, cId } = req.params;
  const { other } = req.body;
  const updates = {};
  if (!other) {
    return res.status(400).send({ message: "Incomplete Data" });
  }
  if (other) {
    updates.other = other;
  }
  ChatContent.findOneAndUpdate({ _id: cId, chat: _id }, { $set: updates })
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

// const Update = (req, res) => {
//   const { _id } = req.params;
//   const { title } = req.body;
//   if (!title) {
//     res.status(400).send({ message: "Incomplete Data" });
//   } else {
//     Chat.findByIdAndUpdate(
//       { _id },
//       {
//         $set: {
//           title,
//         },
//       }
//     )
//       .then((result) => {
//         if (result) {
//           res.status(200).send({ message: "success" });
//         } else {
//           res.status(404).send({ message: "not found" });
//         }
//       })
//       .catch((error) => {
//         res.status(400).send({ message: "error", error });
//       });
//   }
// };

// const Delete = (req, res) => {
//   const { _id } = req.params;
//   Chat.findByIdAndDelete({ _id })
//     .then((result) => {
//       if (result) {
//         res.status(200).send({ message: "success" });
//       } else {
//         res.status(404).send({ message: "not found" });
//       }
//     })
//     .catch((error) => {
//       res.status(400).send({ message: "error", error });
//     });
// };

module.exports = { GetAll, Get, CreateNewChatContent, UpdateChatContent };
