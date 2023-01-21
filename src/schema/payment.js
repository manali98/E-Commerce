const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    id: String,
    receiptId: String,
    amount: Number,
    currency: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("payment", paymentSchema);
