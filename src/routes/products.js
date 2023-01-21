const express = require("express");
const route = express.Router();
const productModel = require("../schema/product");
const { authMiddleware } = require("../middleware/auth");
const productValidator = require("../validationSchema/productValidator");
const multer = require("multer");
const { createWriteStream, ReadStream } = require("fs");

const stream = createWriteStream("products.txt");

//create storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

//for types of file
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  }
  else {
    cb(new Error("This file is not valid."));
  }
};

//for image uploading
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, //10MB
  },
});

//GET products listing api
route.get("/list", async (req, res) => {
  const result = await productModel.find({});

  const data = result?.map((x) => {
    return {
      id: x.id,
      name: x.name,
      brand: x.brand,
      price: x.price,
      category: x.category,
      productImage: x.productImage,
    };
  });
  res.send({ success: true, message: "Success", data: data });
  
});

route.get("/list/:id", async (req, res) => {
  const result = await productModel.find({ id: req.params.id });

  const data = result?.map((x) => {
    return {
      id: x.id,
      name: x.name,
      brand: x.brand,
      price: x.price,
      category: x.category,
      productImage: x.productImage,
    };
  });

  res.send({ success: true, message: "Success", data: data });
});

//GET search api
route.get("/search/:key", async (req, res) => {
  const data = await productModel.find({
    $or: [
      { name: { $regex: req.params.key } },
      { brand: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send({ success: true, message: "Suceess", data: data });
});

//GET api for add new products
route.post(
  "/add",
  upload.single("productImage"),
  authMiddleware,
  productValidator,
  async (req, res) => {
    const productId = await productModel.find();

    const newProduct = {
      id: productId.length + 1,
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      productImage: `http://localhost:8000/${req.file?.path}`,
    };
    const data = new productModel(newProduct);
    res.send(newProduct);
    return await data.save();
  }
);

//Update api for products
route.put("/:id", authMiddleware, async (req, res) => {
  const data = await productModel.updateOne(
    { id: req.params.id },
    { $set: req.body }
  );
  res.send({ suceess: true, message: "Updated Suceessfully.", data: data });
});

//Delete api for products
route.delete("/:id", authMiddleware, async (req, res) => {
  const data = await productModel.deleteOne({ id: req.params.id });

  res.send({ suceess: true, message: "Deleted Successfully.", data: data });
});

//For not found page
route.get("*", (req, res) => {
  res.send({ message: "Page not found." });
});

module.exports = route;
