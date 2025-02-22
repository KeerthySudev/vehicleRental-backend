const Joi = require('joi');

class UserRequests{

  static customerValidationSchema(){
    return Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\d{10}$/).required(),
      city: Joi.string().min(2).max(50).required(),
      state: Joi.string().min(2).max(50).required(),
      country: Joi.string().min(2).max(50).required(),
      pincode: Joi.string().length(6).required(),
      password: Joi.string().min(8).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
      }),
    });
  }

  static updateCustomerValidationSchema(){
    return Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\d{10}$/).required(),
      city: Joi.string().min(2).max(50).required(),
      state: Joi.string().min(2).max(50).required(),
      country: Joi.string().min(2).max(50).required(),
      pincode: Joi.string().length(6).required(),
    });
  }

  static passwordValidationSchema(){
   return Joi.object({
      newPassword: Joi.string().min(8).required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match',
      }),
    });
  }
}


module.exports = UserRequests;
