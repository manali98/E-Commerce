const express = require("express");
const route = express.Router();
const otpModel = require("../../schema/otp");
const message = require("../../templates/sms");
const { sendSms } = require("../../sendSms");
const dotenv = require("dotenv");
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

route.post("/api/otpToPhone", async (req, res) => {
  const user = {
    phone: req.body.phone,
  };

  var otpNo = parseInt(Math.random() * 1000000);

  const welcomeMessage = message(otpNo);

  //send otp to user
  sendSms(user.phone, welcomeMessage);

  client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verifications.create({ to: user.phone, channel: "sms", code: "123456" })
    .then((verifications) => console.log(verifications, "verify"));

  res.status(201).send({
    message: welcomeMessage,
    data: user,
  });
});

route.post("/api/verifyOtp", async (req, res) => {
  const verifyOtp = await otpModel.findOne({ otp: req.body.otp });

  if (!verifyOtp) {
    res.status(400).send({ message: "Please enter valid OTP." });
  } else {
    res.status(200).send({
      success: true,
      message: "OTP verified successfully.",
      data: verifyOtp,
    });

    return await otpModel.remove({ otp: req.body.otp });
  }
});

module.exports = route;
