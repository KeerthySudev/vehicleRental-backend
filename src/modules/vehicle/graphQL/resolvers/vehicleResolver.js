

const vehicleService = require('../../repositories/vehicleRepository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
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

      addVehicle: async (_, { name, description, price,  available_quantity }) => {
        return await vehicleService.addVehicle(name, description, price,  available_quantity);
      },

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



