

const vehicleService = require('../../repositories/vehicleRepository');
const bucket = process.env.MINIO_BUCKET;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const  minioClient  = require('../../../../configs/minio/minioConfig');
const  typesenseClient  = require('../../../../configs/typesense/typesenseConfig');
const manufacturerValidationSchema = require('../../requests/manufactureRequests');
const ExcelJS = require('exceljs');
const axios = require('axios');
const minioPath = process.env.MINIO_PATH;

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

  try {
    const vehicle = {
      id: newVehicle.id.toString(),    // Typesense requires string IDs
      name: newVehicle.name,
      description: newVehicle.description,
      price: newVehicle.price,
      availableQty: newVehicle.availableQty,
      manufacturerName: foundManufacturer.name,  // Include manufacturer name
      modelName: foundModel.name,                // Include model name
      primaryImage: newVehicle.primaryImage,
      secondaryImage: newVehicle.secondaryImage,
      isRentable: false,
    };

    // Add the document to the Typesense collection
    const result = await typesenseClient.collections('vehicles').documents().create(vehicle);
    console.log('Vehicle added to Typesense:', result);

  } catch (error) {
    console.error('Error adding document to Typesense:', error);
    // Optionally handle the error (e.g., log or re-try the operation)
  }
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
          where: { isRentable: true,
            availableQty: { gt: 0 }, },
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
        searchVehicles: async (_, { query }) => {
          const searchParameters = {
            q: query,
            query_by: 'name,description,manufacturerName, modelName', 

            // sort_by: 'price:asc', 
          };
    
          try {
            const result = await typesenseClient.collections('vehicles').documents().search(searchParameters);
            return result.hits.map(hit => ({
              id: hit.document.id,
              name: hit.document.name,
              description: hit.document.description,
              price: hit.document.price,
              manufacturerName: hit.document.manufacturerName,
              modelName: hit.document.modelName,
              availableQty: hit.document.availableQty,
              primaryImage: hit.document.primaryImage,
    secondaryImage: hit.document.secondaryImage,
    isRentable: hit.document.isRentable,
            }));
           
          } catch (error) {
            console.error('Error searching vehicles:', error);
            throw new Error('Search failed. Please try again later.');
          }
        },
        searchRentableVehicles: async (_, { query }) => {
          const searchParameters = {
            q: query,
            query_by: 'name,description,manufacturerName,modelName', // Ensure no typo here
          };
        
          try {
            // Execute the search query
            const result = await typesenseClient.collections('vehicles').documents().search(searchParameters);
        
            // Log the entire result to ensure hits are returned
            console.log('Search result:', result);
        
            // Process the hits and map to your vehicle structure
            const filteredResults = result.hits.map(hit => {
              console.log('Hit document:', hit.document); // Log each hit to check fields
              return {
                id: hit.document.id,
                name: hit.document.name,
                description: hit.document.description,
                price: hit.document.price,
                manufacturerName: hit.document.manufacturerName,
                modelName: hit.document.modelName,
                availableQty: hit.document.availableQty,
                primaryImage: hit.document.primaryImage,
                secondaryImage: hit.document.secondaryImage,
                isRentable: hit.document.isRentable,
              };
            })
            // Filter only rentable vehicles with available quantity greater than 0
            .filter(vehicle => {
              console.log('Filtering vehicle:', vehicle); // Log each vehicle before filtering
              return vehicle.availableQty > 0 && vehicle.isRentable;
            });
        
            // Log filtered results
            console.log('Filtered Results:', filteredResults);
        
            return filteredResults;
          } catch (error) {
            // Handle and log any errors
            console.error('Error searching vehicles:', error);
            throw new Error('Search failed. Please try again later.');
          }
        },
        vehiclesSortedByPrice: async (_, { sortOrder = 'asc' }) => {
          try {
            const searchResults = await typesenseClient
              .collections('vehicles')   // Use your Typesense collection
              .documents()
              .search({
                q: '*',                   // Query all documents
                sort_by: `price:${sortOrder}`,  // Sort by price
              });
    
            // Return the search results in GraphQL-compatible format
            return searchResults.hits.map(hit => hit.document);
          } catch (error) {
            throw new Error(error.message);
          }
        },
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
            isRentable: !vehicle.isRentable, 
          },
        });

        const foundManufacturer = await prisma.manufacturer.findUnique({
          where: { id: vehicle.manufacturerId },
        });
      
        if (!foundManufacturer) {
          throw new Error('Manufacturer not found');
        }
      
        const foundModel = await prisma.model.findUnique({
          where: { id: vehicle.modelId },
        });
      
        if (!foundModel) {
          throw new Error('Model not found');
        }

        console.log("vehicle", vehicle);
        const updatedTypesenseDocument = {
          id: String(vehicle.id), // Convert id to string for Typesense
          name: vehicle.name,
          description: vehicle.description,
          price: vehicle.price,
          availableQty: vehicle.availableQty,
          isRentable: updatedVehicle.isRentable, // Use updated value
          primaryImage: vehicle.primaryImage,
          secondaryImage: vehicle.secondaryImage,
          manufacturerName: foundManufacturer.name , // Flattened
          modelName: foundModel.name ,               // Flattened
        };
    
        await typesenseClient.collections('vehicles').documents().upsert(updatedTypesenseDocument);
  
        return updatedVehicle;
      },
      
      createManufacturer: async (_, { name, imageFile }) => {
        const { error } = manufacturerValidationSchema.validate({ name, imageFile });

  if (error) {
    throw new Error(`Validation Error: ${error.details.map(x => x.message).join(', ')}`);
  }
  console.log("data", imageFile)
        const { createReadStream : createReadStream1, filename: filename1 } = await imageFile.promise;
        const filename2 = `manufacturers/${name}/${filename1}`
  
        // Upload file to MinIO
        const stream = createReadStream1();
        const mimeType = mime.contentType(filename1);
  
        // Upload to MinIO
        await minioClient.putObject(bucket, filename2, stream, {
          'Content-Type': mimeType || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database
        const image = `${minioPath}/${bucket}/${filename2}`;
        console.log(image);
        const newManufacturer = await saveManufacturerToDB({ name, image });
        return newManufacturer;
      },

      importManufacturers: async (_, { file }) => {
        const { createReadStream } = await file.promise;
  
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.read(createReadStream());
        const worksheet = workbook.getWorksheet(1); 
  
        const manufacturers = [];
  
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const name = row.getCell(1).value; 
          const imageUrl = row.getCell(2).value; 
  
          manufacturers.push({ name, imageUrl });
        });
  
        for (const { name, imageUrl } of manufacturers) {
          // Download the image
          const response = await axios.get(imageUrl, { responseType: 'stream' });
          const imageStream = response.data;
  
  
          const imagePath = `manufacturers/${name}.jpg`; // Change as needed
          await minioClient.putObject(bucket, imagePath, imageStream, {
          'Content-Type': 'jpg/jpeg/png' || 'application/octet-stream', // Adjust as needed
        });
   const image =  `${minioPath}/${bucket}/${imagePath}`;
          // Save manufacturer data in the database
          await prisma.manufacturer.create({
            data: {
              name,
              image: image, // Construct the URL for the image
            },
          });
        }
  
        return true;
      },
      deleteManufacturer: async (_, { id }) => {
        // Fetch the manufacturer to get the image path before deleting the record
        const manufacturer = await prisma.manufacturer.findUnique({
          where: { id },
        });
      
        if (!manufacturer) {
          throw new Error("Manufacturer not found");
        }
      
        const presignedUrl = manufacturer.image; // Assuming 'image' contains the presigned URL
        const parsedUrl = new URL(presignedUrl);
        const objectPath = parsedUrl.pathname.replace('/motorent/', '');


        minioClient.removeObject(bucket, objectPath, (err) => {
          if (err) {
            console.error("Error deleting image from Minio: ", err);
          } else {
            console.log("Image deleted successfully from Minio");
          }
        });

        await prisma.manufacturer.delete({
          where: { id },
        });
      
        return true; 
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
      updateVehicle: async (_, { id, data, primaryImageFile , secondaryImageFile}) => {


        // Step 1: Handle image upload if provided
        let primaryImage = null;
        let secondaryImage = null;
        if (primaryImageFile) {
         

          const { createReadStream, filename } = await primaryImageFile.promise;
          const stream = createReadStream();
        const filename1 = `vehicles/${data.name}/${filename}`
  

        const mimeType = mime.contentType(filename);
  
        // Upload to MinIO
        await minioClient.putObject(bucket, filename1, stream, {
          'Content-Type': mimeType || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database
        primaryImage = `${minioPath}/${bucket}/${filename1}`;

        }

        if (secondaryImageFile) {
          const { createReadStream, filename } = await secondaryImageFile.promise;
          const stream = createReadStream();
        const filename1 = `vehicles/${data.name}/${filename}`
  

        const mimeType = mime.contentType(filename);
  
        // Upload to MinIO
        await minioClient.putObject(bucket, filename1, stream, {
          'Content-Type': mimeType || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        secondaryImage = `${minioPath}/${bucket}/${filename1}`;

        }
  
        // Step 2: Update the vehicle in the database using Prisma
        const updatedVehicle = await prisma.vehicle.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            price: data.price,
            availableQty: data.availableQty, // ensure password is hashed if needed
            ...(primaryImage && { primaryImage }), 
            ...(secondaryImage && { secondaryImage }), // Update the image URL if an image was uploaded
          },
          include: {
            manufacturer: true,
            model: true,
          },
        });
        console.log("vehicle", updatedVehicle);


        const updatedTypesenseDocument = {
          id: String(updatedVehicle.id), // Convert id to string for Typesense
          name: updatedVehicle.name,
          description: updatedVehicle.description,
          price: updatedVehicle.price,
          availableQty: updatedVehicle.availableQty,
          isRentable: updatedVehicle.isRentable, // Use updated value
          primaryImage: updatedVehicle.primaryImage,
          secondaryImage: updatedVehicle.secondaryImage,
          manufacturerName: updatedVehicle.manufacturer.name , // Flattened
          modelName: updatedVehicle.model.name ,               // Flattened
        };
    
        await typesenseClient.collections('vehicles').documents().upsert(updatedTypesenseDocument);
  
        return updatedVehicle;
      },

      deleteVehicle: async (_, { id }) => {
        // Check if the vehicle exists
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: Number(id) }, // Ensure id is a number
        });
      
        if (!vehicle) {
          throw new Error(`Vehicle with ID ${id} does not exist.`);
        } else {
          const presignedUrl = vehicle.primaryImage; // Assuming 'primaryImage' contains the presigned URL
          const parsedUrl = new URL(presignedUrl);
          const objectPath = parsedUrl.pathname.replace('/motorent/', '');
      
          // Remove primary image from MinIO
          await minioClient.removeObject(bucket, objectPath);
      
          // Remove secondary image if it exists
          if (vehicle.secondaryImage) {
            const presignedUrl2 = vehicle.secondaryImage;
            const parsedUrl2 = new URL(presignedUrl2);
            const objectPath2 = parsedUrl2.pathname.replace('/motorent/', '');
            await minioClient.removeObject(bucket, objectPath2);
          }
      
          // Delete bookings related to the vehicle
          const bookings = await prisma.booking.findMany({
            where: { vehicleId: Number(id) },
          });
      
          if (bookings.length > 0) {
            await prisma.booking.deleteMany({
              where: { vehicleId: Number(id) },
            });
          }
      
          // Delete vehicle from Prisma
          await prisma.vehicle.delete({
            where: { id: Number(id) },
          });
      
          // Delete vehicle from Typesense
          try {
            await typesenseClient.collections('vehicles').documents(id.toString()).delete(); // Ensure id is passed as string
            console.log(`Vehicle with ID ${id} deleted from Typesense.`);
          } catch (error) {
            console.error(`Error deleting vehicle from Typesense: ${error}`);
          }
      
          return true;
        }
      },
      
      createVehicle: async (_, { name, description, price,  primaryImageFile, secondaryImageFile, availableQty, manufacturerId, modelId }) => {

        const { createReadStream: createReadStreamPrimary, filename: filenamePrimary } = await primaryImageFile.promise;
  
        // Upload file to MinIO
        const streamPrimary = createReadStreamPrimary();
        const mimeTypePrimary = mime.contentType(filenamePrimary);

        const filename1 = `vehicles/${name}/${filenamePrimary}`;
  
        // Upload to MinIO
        await minioClient.putObject(bucket, filename1, streamPrimary, {
          'Content-Type': mimeTypePrimary || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const primaryImage = `${minioPath}/${bucket}/${filename1}`;

        const { createReadStream: createReadStreamSecondary, filename: filenameSecondary } = await secondaryImageFile.promise;
  
        // Upload file to MinIO
        const streamSecondary = createReadStreamSecondary();
        const mimeTypeSecondary = mime.contentType(filenameSecondary);

        const filename2 = `vehicles/${name}/${filenameSecondary}`;
  
        // Upload to MinIO
        await minioClient.putObject(bucket, filename2, streamSecondary, {
          'Content-Type': mimeTypeSecondary || 'application/octet-stream', // Adjust as needed
        });
  
        // Save the image path and name to the database

        const secondaryImage = `${minioPath}/${bucket}/${filename2}`;
        
        const newImage = await saveImageToDB({ name, description, price,  primaryImage, secondaryImage, availableQty, manufacturerId, modelId }); // Function to save in DB
  
        return newImage;
      },

    },
  };
  
  module.exports = vehicleResolvers;



