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
    businessName: { type: String, default: "" },
    businessDescription: { type: String, default: "" },
    businessAddress: {
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      area: { type: String, default: "" },
      pincode: { type: String, default: "" },
      address: { type: String, default: "" },
      googleMaps: { type: String, default: "" },
    },
    other: { groomMakeup: { type: Boolean, default: false } },
    speciality: { type: String, default: "" },
    servicesOffered: { type: [String], default: [] },
    notes: {
      type: [{ text: String, createdAt: { type: Date, default: Date.now() } }],
      default: [],
    },
    category: { type: String, required: true },
    tag: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", VendorSchema);
