const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    wishlist: {
      decor: { type: [ObjectId], ref: "Decor", required: true, default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
