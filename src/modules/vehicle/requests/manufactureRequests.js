const Joi = require('joi');

const manufacturerValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Name" should be a type of 'text'`,
    'string.empty': `"Name" cannot be an empty field`,
    'string.min': `"Name" should have a minimum length of {2}`,
    'any.required': `"Name" is a required field`,
  }),
  imageFile: Joi.any().required().messages({
    'any.required': 'Image is required',
  }),
});

module.exports = manufacturerValidationSchema;
