const Joi = require("joi");

const userValidator = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).trim().required(),
    mobileNo: Joi.number()
      .integer()
      .min(1000000000, "Must be exactly 10 digits")
      .max(9999999999, "Must be exactly 10 digits")
      .required(),
    password: Joi.string().required(),
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"), "Password must match.")
      .required(),
    role: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    res.status(406);
    return res.send(error.details[0].message);
  } else {
    next();
  }
};

module.exports = userValidator;
