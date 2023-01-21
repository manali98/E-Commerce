const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: Number,
  productId: {
    type: Number,
    ref: "products",
    required: true,
  },
  userId: {
    type: Number,
    ref: "register",
    required: true,
  },
  qty: Number,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now() },
});

//virtual populate for product details
orderSchema.virtual("pro", {
  justOne: true,
  localField: "productId", // primary collection id
  foreignField: "id", //refrence collection id
  ref: "products", //secondary collection id
});

orderSchema.virtual("user", {
  justOne: true,
  localField: "userId",
  foreignField: "id",
  ref: "register",
});

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("orders", orderSchema);
