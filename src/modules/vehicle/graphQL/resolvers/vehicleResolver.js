

const vehicleService = require('../../repositories/vehicleRepository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const  minioClient  = require('../../../../configs/minioConfig');
const manufacturerValidationSchema = require('../../requests/manufactureRequests');

const saveManufacturerToDB = async ({ name, image }) => {
  // Assuming you have a Prisma client instance already initialized
  const newManufacturer = await prisma.manufacturer.create({
    data: {
      name,
      image,
    },
  });
  return newManufacturer;
};

const saveImageToDB = async ({ name, description, price,  primaryImage, secondaryImage, availableQty, manufacturerId, modelId }) => {
  // Assuming you have a Prisma client instance already initialized

  const foundManufacturer = await prisma.manufacturer.findUnique({
    where: { id: manufacturerId },
  });

  if (!foundManufacturer) {
    throw new Error('Manufacturer not found');
  }

  const foundModel = await prisma.model.findUnique({
    where: { id: modelId },
  });

  if (!foundModel) {
    throw new Error('Model not found');
  }

  const newVehicle = await prisma.vehicle.create({
    data: {
      name, description, price,  primaryImage, secondaryImage, availableQty, manufacturerId, modelId
    },
    include: {
      manufacturer: true, // Include the manufacturer
      model: true, // Include the model
  },
  });
  return newVehicle;
};

const vehicleResolvers = {

    Query: {
      getAllManufacturers: async () => {
        return await prisma.manufacturer.findMany({
          include: {
            models: true,   // Include models associated with the manufacturer
            vehicles: true, // Include vehicles associated with the manufacturer
          },
        });
      },
      getManufacturerById: async (_, { id }) => {
        return await prisma.manufacturer.findUnique({
          where: { id },
          include: {
            models: true,
            vehicles: true,
          },
        });
      },
      getAllModels: async () => {
        return await prisma.model.findMany({
          include: {
            manufacturer: true, // Include the manufacturer associated with the model
            vehicles: true,     // Include vehicles associated with the model
          },
        });
      },
      getModelById: async (_, { id }) => {
        return await prisma.model.findUnique({
          where: { id },
          include: {
            manufacturer: true,
            vehicles: true,
          },
        });
      },
      getModelsByManufacturer: async (_, { manufacturerId }) => {
        // Fetch models for a specific manufacturer
        return await prisma.model.findMany({ where: { manufacturerId } });
      },
      getAllVehicles: async () => {
        return await prisma.vehicle.findMany({
          include: {
            manufacturer: true, // Include the manufacturer associated with the vehicle
            model: true,       // Include the model associated with the vehicle
          },
        });
      },


      getAllRentableVehicles: async () => {
        return await prisma.vehicle.findMany({
          where: { isRentable: true, },
          include: {
            manufacturer: true, // Include the manufacturer associated with the vehicle
            model: true,       // Include the model associated with the vehicle
          },
        });
      },

      getVehicleById: async (_, { id }) => {
        return await prisma.vehicle.findUnique({
          where: { id },
          include: {
            manufacturer: true,
            model: true,
          },
        });},
    },
    Mutation: {
      toggleRentable :  async (_, { id }) => {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: id },
        });
  
        if (!vehicle) {
          throw new Error('Vehicle not found');
        }
  
        // Toggle the value of isRentable
        const updatedVehicle = await prisma.vehicle.update({
          where: { id: id },
          data: {
            isRentable: !vehicle.isRentable, // Toggle true <-> false
          },
        });
  
        return updatedVehicle;
      },
      
      createManufacturer: async (_, { name, imageFile }) => {
        const { error } = manufacturerValidationSchema.validate({ name, imageFile });

  if (error) {
    throw new Error(`Validation Error: ${error.details.map(x => x.message).join(', ')}`);
  }
  console.log("data", imageFile)
        const { createReadStream : createReadStream1, filename: filename1 } = await imageFile.promise;
        const filename2 = `manufacturers/${filename1}`
  
        // Upload file to MinIO
        const stream = createReadStream1();
        const mimeType = mime.contentType(filename1);
  
        // Upload to MinIO
        await minioClient.putObject('vehicle-images', filename2, stream, {
          'Content-Type': mimeType || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const image = await minioClient.presignedGetObject('vehicle-images', filename2);
        const newManufacturer = await saveManufacturerToDB({ name, image });
        return newManufacturer;
      },
      deleteManufacturer: async (_, { id }) => {
        await prisma.manufacturer.delete({
          where: { id },
        });
        return true; // Return true to indicate successful deletion
      },
      createModel: async (_, { name, manufacturerId }) => {
        return await prisma.model.create({
          data: {
            name,
            manufacturer: {
              connect: { id: manufacturerId }, // Connect to the manufacturer
            },
          },
        });
      },
      deleteModel: async (_, { id }) => {
        await prisma.model.delete({
          where: { id },
        });
        return true; // Return true to indicate successful deletion
      },

      updateVehicle: async (_, { id, name, description, price, primaryImage, secondaryImage, availableQty, manufacturerId, modelId }) => {
        return await prisma.vehicle.update({
          where: { id },
          data: {
            name,
            description,
            price,
            primaryImage,
            secondaryImage,
            availableQty,
            manufacturer: {
              connect: { id: manufacturerId }, 
            },
            model: {
              connect: { id: modelId }, 
            },
          },
        });
      },
      deleteVehicle: async (_, { id }) => {
        // Check if the vehicle exists
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: Number(id) }, // Ensure id is a number
        });
      
        if (!vehicle) {
          throw new Error(`Vehicle with ID ${id} does not exist.`);
        }
      
        else{
          await prisma.vehicle.delete({
            where: { id: Number(id) },
          });
        
          return true;
        }
       
      },
      createVehicle: async (_, { name, description, price,  primaryImageFile, secondaryImageFile, availableQty, manufacturerId, modelId }) => {
        console.log("reached");
        const { createReadStream: createReadStreamPrimary, filename: filenamePrimary } = await primaryImageFile.promise;
  
        // Upload file to MinIO
        const streamPrimary = createReadStreamPrimary();
        const mimeTypePrimary = mime.contentType(filenamePrimary);

        const filename1 = `vehicles/${filenamePrimary}`;
  
        // Upload to MinIO
        await minioClient.putObject('vehicle-images', filename1, streamPrimary, {
          'Content-Type': mimeTypePrimary || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const primaryImage = await minioClient.presignedGetObject('vehicle-images', filename1);

        const { createReadStream: createReadStreamSecondary, filename: filenameSecondary } = await secondaryImageFile.promise;
  
        // Upload file to MinIO
        const streamSecondary = createReadStreamSecondary();
        const mimeTypeSecondary = mime.contentType(filenameSecondary);

        const filename2 = `vehicles/${filenameSecondary}`;
  
        // Upload to MinIO
        await minioClient.putObject('vehicle-images', filename2, streamSecondary, {
          'Content-Type': mimeTypeSecondary || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const secondaryImage = await minioClient.presignedGetObject('vehicle-images', filename2);
        
        const newImage = await saveImageToDB({ name, description, price,  primaryImage, secondaryImage, availableQty, manufacturerId, modelId }); // Function to save in DB
  
        return newImage;
      },

    },
  };
  
  module.exports = vehicleResolvers;



