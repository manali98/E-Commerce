const express = require("express");
const route = express.Router();
const productModel = require("../schema/product");
const orderModel = require("../schema/order");

route.get("/list", async (req, res) => {
  const result = await orderModel?.find().populate("pro").exec();

  const data = result?.map((item) => {
    return {
      productData: {
        id: item?.pro?.id,
        name: item?.pro?.name,
        brand: item?.pro?.brand,
        price: item?.pro?.price,
        category: item?.pro?.category,
        productImage: item?.pro?.productImage,
      },
      qty: item.qty,
      totalPrice: item.totalPrice,
      createdAt: item.createdAt,
    };
  });

  res.status(200).send({ success: true, message: "Success", data: data });
});

route.get("/list/:id", async (req, res) => {
  const result = await orderModel
    .find({ productId: req.params.id })
    .populate("pro", "-_id")
    .exec();

  const user = await orderModel
    .find({ userId: req.params.id })
    .populate("pro", "-_id");

  res.status(200).send({ success: true, message: "Success", data: user });
});

route.post("/create", async (req, res) => {
  const order = await productModel.find({});

  if (!order) {
    res.status(200).send({ message: "Product not Found" });
  } else {
    const newOrder = req.body?.map((item) => {
      return {
        userId: item.userId,
        productId: item.productId,
        qty: item.qty,
        totalPrice: item.totalPrice,
      };
    });

    if (newOrder?.length > 0) {
      res.status(200).send({
        success: true,
        message: "Order Created Successfully",
        data: newOrder,
      });
      return await orderModel.insertMany(newOrder);
    } else {
      res
        .status(406)
        .send({ success: false, message: "Please select atleast one item!" });
    }
  }
});

module.exports = route;
