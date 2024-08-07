const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    profileVerified: { type: Boolean, default: false },
    profileVisibility: { type: Boolean, default: false },
    packageStatus: { type: Boolean, default: false },
    biddingStatus: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now() },
    businessAddress: {
      state: { type: String },
      city: { type: String },
      area: { type: String },
      pincode: { type: String },
      address: { type: String },
      googleMaps: { type: String },
    },
    servicesOffered: { type: [String], default: [] },
    notes: {
      type: [{ text: String, createdAt: { type: Date, default: Date.now() } }],
      default: [],
    },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", VendorSchema);
