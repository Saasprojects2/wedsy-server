const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: {
      costPrice: { type: Number, required: true, default: 0 },
      sellingPrice: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
    },
    included: { type: [String], default: [] },
    decor: { type: [ObjectId], ref: "Decor", default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", PackageSchema);
