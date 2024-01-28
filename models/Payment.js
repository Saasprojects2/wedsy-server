const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    event: { type: ObjectId, ref: "Event", required: true },
    eventDay: { type: String, required: true },
    amount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    paymentMethod: {
      type: String,
      default: "default",
      enum: ["default", "razporpay", "cash"],
      required: true,
    },
    razporPayId: { type: String, default: "" },
    response: { type: [Object], default: [] },
    status: {
      type: String,
      required: true,
      default: "null",
      enum: [
        "null",
        "created",
        "attempted",
        "paid",
        "partially_paid",
        "expired",
        "canceled",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
