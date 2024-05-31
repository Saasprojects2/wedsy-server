const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const EventSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    eventAccess: { type: [String], default: [] },
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
                platformRate: { type: Number, default: 1 },
                flooringRate: { type: Number, default: 1 },
                decorPrice: { type: Number, default: 1 },
                dimensions: {
                  length: { type: Number, default: 0 },
                  breadth: { type: Number, default: 0 },
                  height: { type: Number, default: 0 },
                },
                price: { type: Number, default: 0 },
                category: {
                  type: String,
                  required: true,
                },
                variant: {
                  type: String,
                  required: true,
                },
                user_notes: { type: String, default: "" },
                admin_notes: { type: String, default: "" },
                addOns: {
                  type: [
                    {
                      name: { type: String, default: "" },
                      price: { type: Number, default: 0 },
                    },
                  ],
                  required: true,
                  default: [],
                },
                included: { type: [String], default: [] },
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
                      platformRate: { type: Number, default: 1 },
                      flooringRate: { type: Number, default: 1 },
                      decorPrice: { type: Number, default: 1 },
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
          customItems: {
            type: [
              {
                name: { type: String, required: true },
                price: { type: Number, default: 0 },
                quantity: { type: Number, default: 1 },
                image: { type: String, default: "" },
                includeInTotalSummary: {
                  type: Boolean,
                  default: false,
                  required: true,
                },
              },
            ],
            default: [],
          },
          customItemsTitle: { type: String, default: "" },
          mandatoryItems: {
            type: [
              {
                title: { type: String, required: true },
                image: { type: String, default: "" },
                description: { type: String, required: true },
                price: { type: Number, default: 0 },
                itemRequired: { type: Boolean, default: false },
                includeInTotalSummary: {
                  type: Boolean,
                  default: false,
                  required: true,
                },
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
          // other_costs: {
          //   generator_required: { type: Boolean, default: false },
          //   generator_type: { type: String, default: "" },
          //   generator_quantity: { type: Number, default: 0 },
          //   generator_cost: { type: Number, default: 0 },
          //   transportation_required: { type: Boolean, default: false },
          //   transportation_cost: { type: Number, default: 0 },
          //   total_other_costs: { type: Number, default: 0 },
          // },
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
    amount: {
      total: { type: Number, required: true, default: 0 },
      due: { type: Number, required: true, default: 0 },
      paid: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
      preTotal: { type: Number, required: true, default: 0 },
      costPrice: { type: Number, required: true, default: 0 },
      sellingPrice: { type: Number, required: true, default: 0 },
      summary: {
        type: [
          {
            eventDayId: { type: String, required: true, default: "" },
            decorItems: { type: Number, required: true, default: 0 },
            packages: { type: Number, required: true, default: 0 },
            customItems: { type: Number, required: true, default: 0 },
            mandatoryItems: { type: Number, required: true, default: 0 },
            total: { type: Number, required: true, default: 0 },
            costPrice: { type: Number, required: true, default: 0 },
            sellingPrice: { type: Number, required: true, default: 0 },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
