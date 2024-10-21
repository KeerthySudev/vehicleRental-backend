const Joi = require('joi');


class VehicleRequests {

  static vehicleValidationSchema() {

  return Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name should have a minimum length of 2',
    'string.max': 'Name should not exceed 100 characters',
  }),
  manufacturerId: Joi.number().required().messages({
    'number.base': 'Manufacturer is required',
  }),
  modelId: Joi.number().required().messages({
    'number.base': 'Model is required',
  }),
  fuelType: Joi.string().valid('Petrol', 'Diesel').required().messages({
    'any.only': 'Fuel Type must be Petrol or Diesel',
  }),
  gear: Joi.string().valid('Automatic', 'Manual').required().messages({
    'any.only': 'Gear must be Automatic or Manual',
  }),
  description: Joi.string().min(10).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description should have a minimum length of 10',
  }),
  seats: Joi.number().integer().min(1).required().messages({
    'number.base': 'Seats must be a number',
    'number.min': 'Seats must be at least 1',
  }),
  availableQty: Joi.number().integer().min(1).required().messages({
    'number.base': 'Available quantity must be a number',
    'number.min': 'Available quantity must be at least 1',
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be at least 0',
  }),
  primaryImageFile: Joi.object().required().messages({
    'object.base': 'Primary image is required',
  }),
  otherImageFiles: Joi.array().items(
    Joi.object().required()
  ).max(4).messages({
    'array.max': 'You can only upload a maximum of 4 images',
  }),
});

  }

  static updateVehicleValidationSchema() {

    return Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name should have a minimum length of 2',
      'string.max': 'Name should not exceed 100 characters',
    }),

    fuelType: Joi.string().valid('Petrol', 'Diesel').required().messages({
      'any.only': 'Fuel Type must be Petrol or Diesel',
    }),
    gear: Joi.string().valid('Automatic', 'Manual').required().messages({
      'any.only': 'Gear must be Automatic or Manual',
    }),
    description: Joi.string().min(10).required().messages({
      'string.empty': 'Description is required',
      'string.min': 'Description should have a minimum length of 10',
    }),
    seats: Joi.number().integer().min(1).required().messages({
      'number.base': 'Seats must be a number',
      'number.min': 'Seats must be at least 1',
    }),
    availableQty: Joi.number().integer().min(1).required().messages({
      'number.base': 'Available quantity must be a number',
      'number.min': 'Available quantity must be at least 1',
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be at least 0',
    }),
  });
  
    }

    static manufacturerValidationSchema(){
      return Joi.object({
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
    }
}




module.exports = VehicleRequests;
