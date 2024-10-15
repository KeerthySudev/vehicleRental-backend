
const customerValidationSchema = require('../../requests/userRequests');
const userService = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const  minioClient  = require('../../../../configs/minio/minioConfig');
const bucket = process.env.MINIO_BUCKET;
const minioPath = process.env.MINIO_PATH;
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Replace with your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Replace with your Twilio Auth Token
const verifySid = process.env.TWILIO_VERIFY_SID; // Replace with your Verify Service SID

const client = twilio(accountSid, authToken);


// Define resolvers for your schema
const userResolvers = {
  Query: {
    customers: async () => {
      return await userService.getAllCustomers();
    
  },
  customer: async (_, { id }) => {
    return await prisma.customer.findUnique({
      where: { id },
    });
    
  },
  },
    Mutation: {
      updateCustomer: async (_, { id, data, imageFile }) => {

        const { error } = customerValidationSchema.validate(data);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        // Step 1: Handle image upload if provided
        let image = null;
        
        if (imageFile) {
          console.log(imageFile);
          const { createReadStream, filename } = await imageFile.promise;
          const stream = createReadStream();
        const filename1 = `customers/${data.name}/${filename}`
  

        const mimeType = mime.contentType(filename);
  
        // Upload to MinIO
        await minioClient.putObject(bucket, filename1, stream, {
          'Content-Type': mimeType || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

       image = `${minioPath}/${bucket}/${filename1}`;

        }
  
        // Step 2: Update the customer in the database using Prisma
        const updatedCustomer = await prisma.customer.update({
          where: { id },
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            password: hashedPassword, // ensure password is hashed if needed
            ...(image && { image }), // Update the image URL if an image was uploaded
          },
        });
  
        return updatedCustomer;
      },

      deleteUser: async (_, { id }) => {
        return await userService.deleteUser(id);
        
      },
      validateCustomer: async (_, { customerInput }) => {
        // Validate input with Joi
        const { error } = customerValidationSchema.validate(customerInput);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }
        const existingUserByPhone = await prisma.customer.findUnique({
          where: {
            phone: customerInput.phone,
          },
        });
      
        if (existingUserByPhone) {
          throw new Error('Phone number already exists');
        }
      
        // Check if email already exists
        const existingUserByEmail = await prisma.customer.findUnique({
          where: {
            email: customerInput.email,
          },
        });
      
        if (existingUserByEmail) {
          throw new Error('Email already exists');
        }
        return true;
      },
      registerCustomer: async (_, { customerInput }) => {
        // Validate input with Joi
        const { error } = customerValidationSchema.validate(customerInput);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }
        const hashedPassword = await bcrypt.hash(customerInput.password, 10);
        return await userService.registerCustomer(customerInput,hashedPassword);
      },
      login: async (_, { email, password }) => {
        const user = await userService.getCustomer(email);
  
        if (!user) {
          throw new Error('User not found');
        }
  
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error('Invalid password');
        }
  
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
  
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
      },



      sendVerification: async (_, { phoneNumber }) => {
        try {
          const verification = await client.verify.v2.services(verifySid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });
          return verification.status; // Will return 'pending' if successful
        } catch (error) {
          throw new Error('Error sending verification code');
        }
      },
  
      // Mutation to verify the OTP code
      verifyCode: async (_, { phoneNumber, code }) => {
        try {
          const verificationCheck = await client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: phoneNumber, code });
          
          if (verificationCheck.status === 'approved') {
            // Logic to update user as verified in your database can be added here
            return 'Verification successful';
          } else {
            return 'Verification failed';
          }
        } catch (error) {
          throw new Error('Error verifying code');
        }
      }
    },
};

module.exports = userResolvers;



