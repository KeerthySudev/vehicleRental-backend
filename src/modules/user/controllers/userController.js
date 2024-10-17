const UserRepository = require("../repositories/userRepository");
const customerValidation = require("../requests/userRequests");
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
  static async validateCustomer(customerInput) {
    const { error } =
      customerValidation.customerValidationSchema.validate(customerInput);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
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

  static async registerCustomer(customerInput) {
    const { error } =
      customerValidation.customerValidationSchema.validate(customerInput);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }
    const hashedPassword = await bcrypt.hash(customerInput.password, 10);
    return await UserRepository.registerCustomer(customerInput, hashedPassword);
  }

  static async getCustomerById(id) {
    return await UserRepository.getCustomerById(id);
  }

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
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        state: user.state,
        country: user.country,
        pincode: user.pincode,
        role: user.role,
      },
    };
  }
  static async updateCustomer({ id, data, imageFile }) {
    const { error } =
      customerValidation.updateCustomerValidationSchema.validate(data);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
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

    const { error } =
      customerValidation.passwordValidationSchema.validate(data);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await UserRepository.updatePassword({ id, hashedPassword });
  }

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
