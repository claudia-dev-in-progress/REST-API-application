const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

const verifyUserSchema = Joi.object({
  email: Joi.string().required().email(),
});

module.exports = {
  userSchema,
  verifyUserSchema,
};
