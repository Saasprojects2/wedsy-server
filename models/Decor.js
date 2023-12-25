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
      // enum: ["BestSeller", "Popular", ""],
      default: "",
    },
    spotlight: { type: Boolean, default: false },
    spotlightColor: { type: String, default: "" },
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
      fabric: { type: [String], default: [] },
      style: {
        type: String,
        required: false,
        enum: ["Modern", "Traditional", ""],
        default: "",
      },
      nameboardMaterial: { type: [String], default: [] },
    },
    productInfo: {
      id: { type: String, default: "" },
      measurements: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        area: { type: Number, default: 0 },
        radius: { type: Number, default: 0 },
        other: { type: String, default: "" },
      },
      included: { type: [String], default: [] },
      variant: {
        artificialFlowers: {
          costPrice: { type: Number, required: true, default: 0 },
          sellingPrice: { type: Number, required: true, default: 0 },
          discount: { type: Number, required: true, default: 0 },
        },
        mixedFlowers: {
          costPrice: { type: Number, required: true, default: 0 },
          sellingPrice: { type: Number, required: true, default: 0 },
          discount: { type: Number, required: true, default: 0 },
        },
        naturalFlowers: {
          costPrice: { type: Number, required: true, default: 0 },
          sellingPrice: { type: Number, required: true, default: 0 },
          discount: { type: Number, required: true, default: 0 },
        },
      },
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

DecorSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Decor", DecorSchema);
