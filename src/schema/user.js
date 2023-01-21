const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    mobileNo: { type: String, unique: true },
    password: String,
    confirmPassword: String,
    token: String,
    role: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("register", userSchema);
