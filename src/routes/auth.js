const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const userValidator = require("../validationSchema/userValidator");
const userModel = require("../schema/user");
const {
  securePassword,
  comparePassword,
} = require("../securePassword/securePassword");
const { verifyToken, generateToken } = require("../middleware/auth");
const otpModel = require("../schema/otp");
const message = require("../templates/sms/index");
const { sendSms } = require("../sendSms");
const dotenv = require("dotenv");
dotenv.config();

//GET api for all registered users
route.get("/userDetails", verifyToken, async (req, res) => {
  const data = await userModel.find({ token: req.headers.authorization });
  res.status(200).send({ success: true, message: success, data: data });
});

route.get("/allUsers", async (req, res) => {
  const data = await userModel.find({});
  res.send({ success: true, message: "Success", data: data });
});

//Post api for signup
route.post("/register", userValidator, async (req, res) => {
  const user = req.body;

  const userId = await userModel.find();

  const existingUser = await userModel
    .findOne({
      mobileNo: req.body.mobileNo,
    })
    .lean(true);

  //Generate token
  const token = await generateToken(req.body);

  //Encrypt password
  const hashedPassword = await securePassword(req.body.password);

  if (existingUser) {
    res.status(403).send({ message: "User already exist!!" });
  } else {
    const data = new userModel({
      id: userId.length + 1,
      name: req.body.name,
      mobileNo: req.body.mobileNo,
      password: hashedPassword,
      confirmPassword: req.body.confirmPassword,
      token: token,
      role: req.body.role,
    });

    res.status(200).send({
      success: true,
      message: "User Registered Suceessfully.",
      data: {
        user,
        token,
      },
    });
    return await data.save();
  }
});

//Post api for login
route.post("/login", async (req, res) => {
  if (req.body.mobileNo && req.body.password) {
    const validUser = await userModel.findOne({ mobileNo: req.body.mobileNo });
    if (!validUser)
      res.status(400).send({ success: false, message: "Invalid Credentials" });

    if (validUser.token === req.headers.authorization) {
      const confirm = await comparePassword(
        req.body.password,
        validUser.password
      );
      if (confirm) {
        res.status(200).send({
          suceess: true,
          message: "User LoggedIn Suceessfully.",
          data: { role: validUser.role, token: validUser.token },
        });
      } else {
        res.send({ message: "Invalid Password." });
      }
    } else {
      res.status(400).send({ message: "User not found." });
    }
  } else {
    res
      .status(400)
      .send({ message: "MobileNo and password both are required!" });
  }
});

//Login using otp
route.post("/loginWithOtp", async (req, res) => {
  if (req.body.mobileNo && req.body.password) {
    const validUser = await userModel.findOne({ mobileNo: req.body.mobileNo });
    if (!validUser) res.status(400).send({ message: "Invalid Credentials" });

    if (validUser) {
      const token = jwt.sign(
        { validUser, role: validUser.role },
        process.env.SECRET_KEY
      );

      //Generate OTP
      const otpNo = parseInt(Math.random() * 1000000);

      await otpModel.create({
        mobileNo: req.body.mobileNo,
        otp: otpNo,
      });

      const welcomeMessage = message(otpNo);
      await sendSms(req.body.mobileNo, welcomeMessage);

      return res.status(200).send({
        success: true,
        message: "User loggedin successfully.",
        data: { token: token, role: validUser.role, otp: otpNo },
      });
    } else {
      res.status(400).send({ success: false, message: "No user found" });
    }
  } else {
    res.status(400).send({
      success: false,
      message: "MobileNo and Password both are required!",
    });
  }
});

module.exports = route;
