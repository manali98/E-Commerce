const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    brand: String,
    price: Number,
    category: String,
    productImage: String,
  },
  {
    timestamps: true,
  }
);

// Model using schema
module.exports = mongoose.model("products", productSchema);
