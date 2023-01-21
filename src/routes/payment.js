const express = require("express");
const route = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const paymentModel = require("../schema/payment");
const dotenv = require("dotenv");
dotenv.config();



route.post("/ordersPay", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
      // handler: (response) => console.log(response, "res"),
    };


    instance.orders.create(options, async (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong!" });
      }

      const newPayment = {
        id: order.id,
        receiptId: order.receipt,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      };

      const result = new paymentModel(newPayment);
      res.status(200).json({ data: order });
      return await result.save();
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
});

route.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = route;
