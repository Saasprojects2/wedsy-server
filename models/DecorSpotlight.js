const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const DecorSpotlightSchema = new mongoose.Schema(
  {
    decor: { type: ObjectId, ref: "Decor", required: true },
    background: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DecorSpotlight", DecorSpotlightSchema);
