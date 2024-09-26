

const vehicleService = require('../../repositories/vehicleRepository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');

const { createWriteStream } = require('fs');
const path = require('path');
const  minioClient  = require('../../../../configs/minioConfig');

const saveImageToDB = async ({ name, description, price,  primaryImage, secondaryImage, availableQty, manufacture, model }) => {
  // Assuming you have a Prisma client instance already initialized
  const newVehicle = await prisma.vehicle.create({
    data: {
      name, description, price,  primaryImage, secondaryImage, availableQty, manufacture, model
    },
  });
  return newVehicle;
};

const vehicleResolvers = {

    Query: {
      getAllVehicles: async () => {
        return await prisma.vehicle.findMany();
      },
      getVehicleById: async (_, { id }) => {
        return await prisma.vehicle.findById(id)},
      vehicles: async () => {
        return await vehicleService.getAllVehicles();
      },
      vehicle: async (_, { id }) => {
        return await vehicleService.getVehicleById(id);
      },
      images: async () => {
        const result = await pool.query('SELECT * FROM images');
        return result.rows;
    },
    },
    Mutation: {

      // addVehicle: async (_, { name, description, price,  primary_image, available_quantity }) => {
      //   try {
      //     console.log("name",name);
      //     console.log("file",primary_image);
      //     // Upload primary image to MinIO
      //     const primaryImagePath = await vehicleService.uploadVehicleImage(primary_image, 'vehicle-images', `${name}_primary`);
  
      //     // Save vehicle details in the database
      //     const result = await vehicleService.addVehicle(name, description, price, primaryImagePath, available_quantity);
  
      //     return result; // Return the saved vehicle details
      //   } catch (error) {
      //     console.error("Error adding vehicle:", error);
      //     throw new Error("Failed to add vehicle");
      //   }
      // },

      // addVehicle: async (_, { name, description, price, primary_image, other_images, available_quantity }) => {
      //   return await vehicleService.addVehicle(name, description, price, primary_image, other_images, available_quantity);
      // },

      addVehicle: async (_, { name, description, price,  available_quantity }) => {
        return await vehicleService.addVehicle(name, description, price,  available_quantity);
      },

      // addVehicle: async (_, { name, description, price, primary_image_path, other_images_paths, available_quantity }) => {
        // try {
        //   // Upload primary image to MinIO
        //   const primaryImageUpload = await fileService.uploadVehicleImage(primary_image_path, 'vehicle-images', `${name}_primary`);
  
        //   // Upload other images to MinIO
        //   const otherImagesUploads = await Promise.all(
        //     other_images_paths.map(imagePath => 
        //       fileService.uploadVehicleImage(imagePath, 'vehicle-images', `${name}_${imagePath}`)
        //     )
        //   );
  
        //   // Save vehicle details in the database
        //   const result = await vehicleService.addVehicle(name, description, price, primaryImageUpload, otherImagesUploads, available_quantity);
  
        //   return result; // Return the saved vehicle details
        // } catch (error) {
        //   console.error("Error adding vehicle:", error);
        //   throw new Error("Failed to add vehicle");
        // }
      // },

      updateVehicle: async (_, { id, name, description, price, primary_image, other_images, available_quantity }) => {
        return await vehicleService.updateVehicle(id, name, description, price, primary_image, other_images, available_quantity);
      },
      deleteVehicle: async (_, { id }) => {
        return await vehicleService.deleteVehicle(id);
      },
      createVehicle: async (_, { name, description, price,  primaryImageFile, secondaryImageFile, availableQty, manufacture, model }) => {
        console.log("reached");
        const { createReadStream: createReadStreamPrimary, filename: filenamePrimary } = await primaryImageFile;
  
        // Upload file to MinIO
        const streamPrimary = createReadStreamPrimary();
        const mimeTypePrimary = mime.contentType(filenamePrimary);
  
        // Upload to MinIO
        await minioClient.putObject('vehicle-images', filenamePrimary, streamPrimary, {
          'Content-Type': mimeTypePrimary || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const primaryImage = await minioClient.presignedGetObject('vehicle-images', filenamePrimary);

        const { createReadStream: createReadStreamSecondary, filename: filenameSecondary } = await secondaryImageFile;
  
        // Upload file to MinIO
        const streamSecondary = createReadStreamSecondary();
        const mimeTypeSecondary = mime.contentType(filenameSecondary);
  
        // Upload to MinIO
        await minioClient.putObject('vehicle-images', filenameSecondary, streamSecondary, {
          'Content-Type': mimeTypeSecondary || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const secondaryImage = await minioClient.presignedGetObject('vehicle-images', filenameSecondary);
        
        const newImage = await saveImageToDB({ name, description, price,  primaryImage, secondaryImage, availableQty, manufacture, model }); // Function to save in DB
  
        return newImage;
      },

    },
  };
  
  module.exports = vehicleResolvers;



