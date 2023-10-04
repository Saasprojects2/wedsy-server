const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const EventSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "Decor", required: true },
    name: { type: String, required: true },
    community: { type: String, default: "" },
    eventDays: {
      type: [
        {
          name: { type: String, required: true },
          date: { type: String, required: true },
          time: { type: String, required: true },
          venue: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
