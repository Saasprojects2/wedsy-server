const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", ConfigSchema);
