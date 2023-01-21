const express = require("express");
const app = express();
const cors = require("cors");
const products = require("./src/routes/products");
const auth = require("./src/routes/auth");
const payment = require("./src/routes/payment");
const orders = require("./src/routes/orders");
const phoneOtp = require("./src/routes/otp/otpToPhone");
const { verifyToken } = require("./src/middleware/auth");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

//db connection
mongoose.connect(process.env.MONGODB_URI);

//built in middleware express.json
app.use(express.json());

//third-party middleware
app.use(cors());

//middlwware for file types
app.use("/uploads", express.static("./uploads"));

//routes
app.use("/api/auth", auth);
app.use("/api/products", verifyToken, products);
app.use("/api/orders", verifyToken, orders);
app.use("/api", payment);
app.use("/", phoneOtp);

//page not found route
app.use("*", async (req, res) => {
  res.status(404).send({ success: false, message: "Page not found" });
});

const port = process.env.PORT || 9000;

app.listen(port, () => console.log(`Server is listening on ${port}`));
