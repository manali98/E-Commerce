const Joi = require("joi");

const productValidator = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    price: Joi.number().min(1).required(),
    brand: Joi.string().min(2).required(),
    category: Joi.string().min(2).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    res.status(406);
    return res.send({ message: "All fields are required." });
  } else {
    next();
  }
};

module.exports = productValidator;
