const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const EventSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
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
                quantity: { type: Number, default: 1 },
                unit: { type: String, default: "" },
                decor: { type: ObjectId, ref: "Decor" },
                platform: { type: Boolean, default: false },
                flooring: { type: String, default: "" },
                dimensions: {
                  length: { type: Number, default: 0 },
                  breadth: { type: Number, default: 0 },
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
                variant: {
                  type: String,
                  required: true,
                  enum: ["artificialFlowers", "naturalFlowers", "mixedFlowers"],
                },
                user_notes: { type: String, default: "" },
                admin_notes: { type: String, default: "" },
              },
            ],
            default: [],
          },
          packages: {
            type: [
              {
                package: { type: ObjectId, ref: "DecorPackage" },
                price: { type: Number, default: 0 },
                variant: {
                  type: String,
                  required: true,
                  enum: ["artificialFlowers", "naturalFlowers", "mixedFlowers"],
                },
                decorItems: {
                  type: [
                    {
                      quantity: { type: Number, default: 1 },
                      unit: { type: String, default: "" },
                      decor: { type: ObjectId, ref: "Decor" },
                      platform: { type: Boolean, default: false },
                      flooring: { type: String, default: "" },
                      dimensions: {
                        length: { type: Number, default: 0 },
                        breadth: { type: Number, default: 0 },
                        height: { type: Number, default: 0 },
                      },
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
                user_notes: { type: String, default: "" },
                admin_notes: { type: String, default: "" },
              },
            ],
            default: [],
          },
          status: {
            finalized: { type: Boolean, default: false },
            approved: { type: Boolean, default: false },
            paymentDone: { type: Boolean, default: false },
            completed: { type: Boolean, default: false },
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
