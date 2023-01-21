const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobileNo: Number,
  otp: Number,
  expirationTime: Date,
});

module.exports = mongoose.model("otp", otpSchema);
