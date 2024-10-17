const UserController = require("../../controllers/userController");

const userResolvers = {
  Query: {
    customer: async (_, { id }) => {
      return await UserController.getCustomerById(id);
    },
  },
  Mutation: {
    updateCustomer: async (_, { id, data, imageFile }) => {
      return await UserController.updateCustomer({ id, data, imageFile });
    },

    validateCustomer: async (_, { customerInput }) => {
      return await UserController.validateCustomer(customerInput);
    },
    registerCustomer: async (_, { customerInput }) => {
      return await UserController.registerCustomer(customerInput);
    },
    login: async (_, { email, password }) => {
      return await UserController.login({ email, password });
    },

    changePassword: async (
      _,
      { id, password, newPassword, confirmPassword }
    ) => {
      return await UserController.changePassword({
        id,
        password,
        newPassword,
        confirmPassword,
      });
    },

    sendVerification: async (_, { phoneNumber }) => {
      return await UserController.sendVerification(phoneNumber);
    },

    verifyCode: async (_, { phoneNumber, code }) => {
      return await UserController.verifyCode({ phoneNumber, code });
    },
  },
};

module.exports = userResolvers;
