
const customerValidationSchema = require('../../requests/userRequests');
const userService = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const { GraphQLUpload } = require('graphql-upload');
const  minioClient  = require('../../../../configs/minioConfig');

const saveImageToDB = async ({ name, path, extraPath }) => {
  // Assuming you have a Prisma client instance already initialized
  const newImage = await prisma.image.create({
    data: {
      name,
      path, 
      extraPath,
    },
  });
  return newImage;
};


// Define resolvers for your schema
const userResolvers = {
  Upload: GraphQLUpload,
  Query: {
    usersTest: async () => {
        return await prisma.user.findMany();
      },
      getImage: async (_, { id }) => {
        return await prisma.image.findById(id); // Fetch image from the database by ID
      },
      getAllImages: async () => {
        return await prisma.image.findMany(); // Fetch all images from the database
      },
    users: async () => {
        return await userService.getAllUsers();
      
    },
    customers: async () => {
      return await userService.getAllCustomers();
    
  },
  customer: async (_, { email }) => {
    return await userService.getCustomer(email);
    
  },
  },
    Mutation: {
        addUserTest: async (_, { name, email }) => {
          
            return await prisma.user.create({
              data: {
                name,
                email,
              },
            });
          },
          uploadImageTest: async (_, { name, file, extraFile }) => {
            const { createReadStream: createReadStream1, filename: filename1 } = await file;
      
            // Upload file to MinIO
            const stream1 = createReadStream1();
            const mimeType1 = mime.contentType(filename1);
      
            // Upload to MinIO
            await minioClient.putObject('vehicle-images', filename1, stream1, {
              'Content-Type': mimeType1 || 'application/octet-stream', // Adjust as needed
            });
      
            // Save the image path and name to the database

            const path = await minioClient.presignedGetObject('vehicle-images', filename1);

            const { createReadStream: createReadStream2, filename: filename2 } = await extraFile;
      
            // Upload file to MinIO
            const stream2 = createReadStream2();
            const mimeType2 = mime.contentType(filename2);
      
            // Upload to MinIO
            await minioClient.putObject('vehicle-images', filename2, stream2, {
              'Content-Type': mimeType2 || 'application/octet-stream', // Adjust as needed
            });
      
            // Save the image path and name to the database

            const extraPath = await minioClient.presignedGetObject('vehicle-images', filename2);
            
            const newImage = await saveImageToDB({ name, path,extraPath }); // Function to save in DB
      
            return newImage;
          },
      addUser: async (_, { name }) => {
        return await userService.addUser(name);
        
      },
      updateUser: async (_, { id, name }) => {
        return await userService.updateUser(id, name);
        
      },
      deleteUser: async (_, { id }) => {
        return await userService.deleteUser(id);
        
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
          },
        };
      },
    },
};

module.exports = userResolvers;



