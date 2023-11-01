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
          decorItems: {
            type: [
              {
                decor: { type: ObjectId, ref: "Decor" },
                plaform: { type: Boolean, default: false },
                carpet: { type: String, default: "" },
                dimensions: {
                  length: { type: Number, default: 0 },
                  bredth: { type: Number, default: 0 },
                  height: { type: Number, default: 0 },
                },
                price: { type: Number, default: 0 },
                category: {
                  type: String,
                  required: true,
                  enum: [
                    "Stage",
                    "Pathway",
                    "Entrance",
                    "Photobooth",
                    "Mandap",
                    "Nameboard",
                  ],
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
