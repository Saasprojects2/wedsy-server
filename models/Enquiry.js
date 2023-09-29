const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    verified: { type: Boolean, default: false, required: true },
    source: { type: String, required: true, default: "Default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", EnquirySchema);
