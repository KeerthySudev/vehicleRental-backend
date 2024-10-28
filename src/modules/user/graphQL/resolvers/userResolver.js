const UserController = require("../../controllers/userController");

const userResolvers = {
  Query: {
    /**
     * Get customer by ID
     *
     * @async
     * @param {number} id - Customer ID
     * @returns {object} Customer data
     */
    customer: async (_, { id }) => {
      return await UserController.getCustomerById(id);
    },
  },
  Mutation: {
    /**
     * Update customer data
     *
     * @async
     * @param {number} id - Customer ID
     * @param {object} data - Customer data
     * @param {file} imageFile - Customer image file (optional)
     * @returns {object} Updated customer data
     */
    updateCustomer: async (_, { id, data, imageFile }) => {
      return await UserController.updateCustomer({ id, data, imageFile });
    },

    /**
     * Validate customer data
     *
     * @async
     * @param {object} customerInput - Customer input data
     * @returns {boolean} True if valid
     */
    validateCustomer: async (_, { customerInput }) => {
      return await UserController.validateCustomer(customerInput);
    },

    /**
     * Register a new customer
     *
     * @async
     * @param {object} customerInput - Customer registration data
     * @returns {object} Created customer data
     */
    registerCustomer: async (_, { customerInput }) => {
      return await UserController.registerCustomer(customerInput);
    },

    /**
     * Login customer
     *
     * @async
     * @param {string} email - Customer email
     * @param {string} password - Customer password
     * @returns {object} Login result
     */
    login: async (_, { email, password }) => {
      return await UserController.login({ email, password });
    },

    /**
     * Change customer password
     *
     * @async
     * @param {number} id - Customer ID
     * @param {string} password - Current password
     * @param {string} newPassword - New password
     * @param {string} confirmPassword - Confirm new password
     * @returns {boolean} True if password changed successfully
     */
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

    /**
     * Send verification code to customer's phone number
     *
     * @async
     * @param {string} phoneNumber - Customer phone number
     * @returns {boolean} True if sent successfully
     */
    sendVerification: async (_, { phoneNumber }) => {
      return await UserController.sendVerification(phoneNumber);
    },

    /**
     * Verify customer's verification code
     *
     * @async
     * @param {string} phoneNumber - Customer phone number
     * @param {string} code - Verification code
     * @returns {boolean} True if verified successfully
     */
    verifyCode: async (_, { phoneNumber, code }) => {
      return await UserController.verifyCode({ phoneNumber, code });
    },
  },
};

module.exports = userResolvers;
