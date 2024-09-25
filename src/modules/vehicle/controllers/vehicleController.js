const pool = require('../../../configs/dbConfig');
const vehicleService = require('../repositories/vehicleRepository');
const minioClient = require('../../../configs/minioConfig');

const uploadImage = async (req, res) => {
  try {
    const { file } = req; // Get the uploaded file from the request

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Here, you would upload the file to MinIO and save the path to the database
    const imagePath = await fileService.uploadVehicleImage(file.buffer, 'vehicle-images', file.originalname);

    // Respond with the image path or any other necessary data
    res.status(200).json({ imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
};

const vehicleResolvers = {
  // Upload: {
  //   __serialize: (value) => value,
  //   __parseValue: (value) => value,
  //   __parseLiteral: (ast) => ast.value,
  // },
    Query: {
      hello: () => 'Hello, Vehicle Rental Management!',
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
      uploadImage: async (_, { name, file }) => {
        const { createReadStream, filename, mimetype } = await file;
        const objectName = `${name}_${filename}`;
  
        // Upload image to MinIO
        const imagePath = await uploadImage({ path: createReadStream(), mimetype }, 'images', objectName);
  
        // Store image path in the database
        const result = await pool.query(
          'INSERT INTO images (name, image_path) VALUES ($1, $2) RETURNING *',
          [name, imagePath]
        );
        return result.rows[0];
      },
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

    },
  };
  
  module.exports = {vehicleResolvers,uploadImage};