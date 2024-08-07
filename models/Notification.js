const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    references: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
