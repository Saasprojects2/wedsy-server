const mongoose = require("mongoose");

const DecorSchema = new mongoose.Schema(
  {
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
    label: {
      type: String,
      required: false,
      enum: ["BestSeller", "Popular", ""],
    },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    tags: { type: [String], required: true, default: [] },
    image: { type: String, required: true, default: "" },
    thumbnail: { type: String, required: true, default: "" },
    video: { type: String, default: "" },
    description: { type: String, default: "" },
    pdf: { type: String, default: "" },
    productVariation: {
      colors: { type: [String], required: true, default: [] },
      occassion: { type: [String], required: true, default: [] },
      flowers: { type: [String], required: true, default: [] },
      fabric: { type: String, default: "" },
      style: {
        type: String,
        required: false,
        enum: ["Modern", "Traditional", ""],
        default: "",
      },
      // nameboardMaterial: { type: [String], required: true, default: [] },
    },
    productInfo: {
      id: { type: String, default: "" },
      measurements: { type: String, default: "" },
      costPrice: { type: Number, required: true, default: 0 },
      flowers: {
        artificial: { type: Number, required: true, default: 0 },
        mixed: { type: Number, required: true, default: 0 },
        natural: { type: Number, required: true, default: 0 },
      },
      discount: { type: Number, required: true, default: 0 },
      quantity: { type: Number, required: true, default: 1 },
      SKU: { type: String, default: "" },
    },
    seoTags: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      image: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Decor", DecorSchema);
