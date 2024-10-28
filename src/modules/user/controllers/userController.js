/**
 * User Controller
 *
 * Handles user-related operations, including validation, registration, login, and updates.
 *
 * @module UserController
 */

const UserRepository = require("../repositories/userRepository");
const UserRequests = require("../requests/userRequests");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";
const mime = require("mime-types");
const {
  minioClient,
  minioPath,
  bucket,
} = require("../../../configs/minio/minioConfig");
const {
  twilioClient,
  verifySid,
} = require("../../../configs/twilio/twilioConfig");

class UserController {


  /**
   * Validates customer input data.
   *
   * @async
   * @param {object} customerInput - Customer data
   * @returns {boolean} True if valid, throws Error otherwise
   */
  static async validateCustomer(customerInput) {
    const schema = UserRequests.customerValidationSchema();
    const { error } = schema.validate(customerInput);
    if (error) {
      throw new Error(`${error.details[0].message}`);
    }
    const existingUserByPhone = await UserRepository.getCustomerByPhone(
      customerInput.phone
    );

    if (existingUserByPhone) {
      throw new Error("Phone number already exists");
    }

    const existingUserByEmail = await UserRepository.getCustomerByEmail(
      customerInput.email
    );

    if (existingUserByEmail) {
      throw new Error("Email already exists");
    }
    return true;
  }


  /**
   * Registers a new customer.
   *
   * @async
   * @param {object} customerInput - Customer data
   * @returns {object} Registered customer data
   */
  static async registerCustomer(customerInput) {
    const schema = UserRequests.customerValidationSchema();
    const { error } = schema.validate(customerInput);
    if (error) {
      throw new Error(`${error.details[0].message}`);
    }
    const hashedPassword = await bcrypt.hash(customerInput.password, 10);
    return await UserRepository.registerCustomer(customerInput, hashedPassword);
  }


  /**
   * Retrieves a customer by their ID.
   *
   * @async
   * @param {number} id - Customer ID
   * @returns {object} Customer data
   */
  static async getCustomerById(id) {
    return await UserRepository.getCustomerById(id);
  }


  /**
   * Login - Authenticates a customer and returns a JWT token.
   *
   * @async
   * @param {object} credentials - Email and password
   * @returns {object} Token and user data
   */
  static async login({ email, password }) {
    const user = await UserRepository.getCustomer(email);

    if (!user) {
      throw new Error("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return {
      token,
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }


  /**
   * Updates a customer's data.
   *
   * @async
   * @param {object} data - Updated customer data
   * @param {file} imageFile - Optional image file
   * @returns {object} Updated customer data
   */
  static async updateCustomer({ id, data, imageFile }) {
    const schema = UserRequests.updateCustomerValidationSchema();
    const { error } = schema.validate(data);
    if (error) {
      throw new Error(`${error.details[0].message}`);
    }

    let image = null;

    if (imageFile) {
      console.log(imageFile);
      const { createReadStream, filename } = await imageFile.promise;
      const stream = createReadStream();
      const filename1 = `customers/${data.name}/${filename}`;

      const mimeType = mime.contentType(filename);

      // Upload to MinIO
      await minioClient.putObject(bucket, filename1, stream, {
        "Content-Type": mimeType || "application/octet-stream", // Adjust as needed
      });

      // Save the image path and name to the database

      image = `${minioPath}/${bucket}/${filename1}`;
    }

    return await UserRepository.updateCustomer({ id, data, image });
  }


  /**
   * Updates a customer's password.
   *
   * @async
   * @param {object} data - Password change data
   * @returns {boolean} True if successful
   */
  static async changePassword({ id, password, newPassword, confirmPassword }) {
    const user = await UserRepository.getCustomerById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const data = { newPassword, confirmPassword };
    const schema = UserRequests.passwordValidationSchema();
    const { error } = schema.validate(data);
    if (error) {
      throw new Error(`${error.details[0].message}`);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await UserRepository.updatePassword({ id, hashedPassword });
  }


  /**
   * Sends a verification code to a customer's phone.
   *
   * @async
   * @param {string} phoneNumber - Customer phone number
   * @returns {string} Verification status
   */
  static async sendVerification(phoneNumber) {
    try {
      const verification = await twilioClient.verify.v2
        .services(verifySid)
        .verifications.create({ to: phoneNumber, channel: "sms" });
      return verification.status;
    } catch (error) {
      throw new Error("Error sending verification code");
    }
  }

  
  /**
   * Verifies a customer's verification code.
   *
   * @async
   * @param {object} data - Verification code data
   * @returns {string} Verification result
   */
  static async verifyCode({ phoneNumber, code }) {
    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: phoneNumber, code });

      if (verificationCheck.status === "approved") {
        return "Verification successful";
      } else {
        return "Verification failed";
      }
    } catch (error) {
      throw new Error("Error verifying code");
    }
  }
}

module.exports = UserController;
