/**
 * Vehicle Controller
 *
 * Handles vehicle-related operations, including CRUD operations and file uploads.
 *
 * @module VehicleController
 */

const VehicleRepository = require("../repositories/vehicleRepository");
const VehicleRequests = require("../requests/vehicleRequests");
const mime = require("mime-types");
const {
  minioClient,
  minioPath,
  bucket,
} = require("../../../configs/minio/minioConfig");
const ExcelJS = require("exceljs");
const axios = require("axios");

class VehicleController {

  /**
   * Retrieves all vehicle manufacturers.
   *
   * @async
   * @returns {array} List of manufacturers
   */
  static async getAllManufacturers() {
    return await VehicleRepository.getAllManufacturers();
  }

  /**
   * Retrieves all vehicle models.
   *
   * @async
   * @returns {array} List of models
   */
  static async getAllModels() {
    return await VehicleRepository.getAllModels();
  }

  /**
   * Creates a new vehicle model.
   *
   * @async
   * @param {object} data - Model data
   * @returns {object} Created model data
   */
  static async createModel({ name, manufacturerId }) {
    return await VehicleRepository.createModel({ name, manufacturerId });
  }

  /**
   * Deletes a vehicle model.
   *
   * @async
   * @param {object} data - Model ID
   * @returns {boolean} True if deleted successfully
   */
  static async deleteModel({ id }) {
    return await VehicleRepository.deleteModel({ id });
  }

  /**
   * Retrieves models for a specific manufacturer.
   *
   * @async
   * @param {number} manufacturerId - Manufacturer ID
   * @returns {array} List of models
   */
  static async getModelsByManufacturer(manufacturerId) {
    return await VehicleRepository.getModelsByManufacturer(manufacturerId);
  }

  /**
   * Creates a new vehicle manufacturer.
   *
   * @async
   * @param {object} data - Manufacturer data
   * @param {file} imageFile - Manufacturer image
   * @returns {object} Created manufacturer data
   */
  static async createManufacturer({ name, imageFile }) {
    // Process file upload to MinIO
    const { createReadStream: createReadStream1, filename: filename1 } =
      await imageFile.promise;
    const filename2 = `manufacturers/${name}/${filename1}`;

    // Upload file to MinIO
    const stream = createReadStream1();
    const mimeType = mime.contentType(filename1);

    await minioClient.putObject(bucket, filename2, stream, {
      "Content-Type": mimeType || "application/octet-stream", // Adjust as needed
    });

    // Generate image URL
    const image = `${minioPath}/${bucket}/${filename2}`;

    // Delegate saving to repository
    return await VehicleRepository.createManufacturer({ name, image });
  }

  /**
   * Deletes a vehicle manufacturer.
   *
   * @async
   * @param {object} data - Manufacturer ID
   * @returns {boolean} True if deleted successfully
   */
  static async deleteManufacturer({ id }) {
    const manufacturer = await VehicleRepository.getManufacturerById({ id });
    if (!manufacturer) {
      throw new Error("Manufacturer not found");
    }

    const presignedUrl = manufacturer.image; // Assuming 'image' contains the presigned URL
    const parsedUrl = new URL(presignedUrl);
    const objectPath = parsedUrl.pathname.replace("/motorent/", "");

    minioClient.removeObject(bucket, objectPath, (err) => {
      if (err) {
        console.error("Error deleting image from Minio: ", err);
      } else {
        console.log("Image deleted successfully from Minio");
      }
    });

    await VehicleRepository.deleteManufacturer({ id });
    return true;
  }

  /**
   * Imports manufacturers from an Excel file.
   *
   * @async
   * @param {file} file - Excel file
   * @returns {boolean} True if imported successfully
   */
  static async importManufacturers({ file }) {
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
      const response = await axios.get(imageUrl, { responseType: "stream" });
      const imageStream = response.data;

      const imagePath = `manufacturers/${name}/${name}.jpg`; // Change as needed
      await minioClient.putObject(bucket, imagePath, imageStream, {
        "Content-Type": "jpg/jpeg/png" || "application/octet-stream", // Adjust as needed
      });
      const image = `${minioPath}/${bucket}/${imagePath}`;
      // Save manufacturer data in the database
      await VehicleRepository.createManufacturer({ name, image });
    }

    return true;
  }

  /**
   * Creates a new vehicle.
   *
   * @async
   * @param {object} data - Vehicle data
   * @param {file} primaryImageFile - Primary image file
   * @param {array} otherImageFiles - Other image files
   * @returns {object} Created Vehicle data
   */
  static async createVehicle({
    name,
    description,
    price,
    primaryImageFile,
    otherImageFiles,
    availableQty,
    manufacturerId,
    modelId,
    seats,
    gear,
    fuelType,
  }) {
    const data = {
      name,
      description,
      price,
      primaryImageFile,
      otherImageFiles,
      availableQty,
      manufacturerId,
      modelId,
      seats,
      gear,
      fuelType,
    };

    const schema = VehicleRequests.vehicleValidationSchema();
    const { error } = schema.validate(data);
    if (error) {
      throw new Error(`${error.details[0].message}`);
    }
    const {
      createReadStream: createReadStreamPrimary,
      filename: filenamePrimary,
    } = await primaryImageFile.promise;

    // Upload file to MinIO
    const streamPrimary = createReadStreamPrimary();
    const mimeTypePrimary = mime.contentType(filenamePrimary);

    const filename1 = `vehicles/${name}/${filenamePrimary}`;

    // Upload to MinIO
    await minioClient.putObject(bucket, filename1, streamPrimary, {
      "Content-Type": mimeTypePrimary || "application/octet-stream", // Adjust as needed
    });

    // Save the image path and name to the database

    const primaryImage = `${minioPath}/${bucket}/${filename1}`;

    let otherImages = [];
    if (otherImageFiles && otherImageFiles.length > 0) {
      otherImages = await Promise.all(
        otherImageFiles.map(async (file) => {
          const {
            createReadStream: createReadStreamPrimary,
            filename: filenamePrimary,
          } = await file.promise;

          // Upload file to MinIO
          const streamPrimary = createReadStreamPrimary();
          const mimeTypePrimary = mime.contentType(filenamePrimary);

          const filename1 = `vehicles/${name}/${filenamePrimary}`;

          // Upload to MinIO
          await minioClient.putObject(bucket, filename1, streamPrimary, {
            "Content-Type": mimeTypePrimary || "application/octet-stream", // Adjust as needed
          });

          // Save the image path and name to the database

          const image = `${minioPath}/${bucket}/${filename1}`;
          return image;
        })
      );
    }

    const newVehicle = await VehicleRepository.createVehicle({
      name,
      description,
      price,
      primaryImage,
      otherImages,
      availableQty,
      manufacturerId,
      modelId,
      seats,
      gear,
      fuelType,
    });
    return newVehicle;
  }

  /**
   * Imports vehicles from an Excel file.
   *
   * @async
   * @param {file} file - Excel file
   * @returns {boolean} True if imported successfully
   */
  static async importVehicles({ file }) {
    const { createReadStream } = await file.promise;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(createReadStream());
    const worksheet = workbook.getWorksheet(1);

    const vehicles = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const name = row.getCell(1).value;
      const description = row.getCell(2).value;
      const price = row.getCell(3).value;
      const availableQty = row.getCell(4).value;
      const manufacturer = row.getCell(5).value;
      const model = row.getCell(6).value;
      const seats = row.getCell(7).value;
      const gear = row.getCell(8).value;
      const fuelType = row.getCell(9).value;
      const primaryImageUrl = row.getCell(10).value;
      const otherImagesUrl = row.getCell(11).value;
      console.log("url", otherImagesUrl);
      vehicles.push({
        name,
        description,
        price,
        availableQty,
        manufacturer,
        model,
        seats,
        gear,
        fuelType,
        primaryImageUrl,
        otherImagesUrl,
      });
    });

    for (const {
      name,
      description,
      price,
      availableQty,
      manufacturer,
      model,
      seats,
      gear,
      fuelType,
      primaryImageUrl,
      otherImagesUrl,
    } of vehicles) {
      const response1 = await axios.get(primaryImageUrl, {
        responseType: "stream",
      });

      const primaryImageStream = response1.data;

      const primaryImagePath = `vehicles/${name}/${name}.jpg`; // Change as needed
      await minioClient.putObject(
        bucket,
        primaryImagePath,
        primaryImageStream,
        {
          "Content-Type": "jpg/jpeg/png" || "application/octet-stream", // Adjust as needed
        }
      );
      const primaryImage = `${minioPath}/${bucket}/${primaryImagePath}`;

      let otherImages = [];
      const formattedOtherImagesUrl = otherImagesUrl.replace(/'/g, '"');
      const otherImagesArray = JSON.parse(formattedOtherImagesUrl);
      otherImages = await Promise.all(
        otherImagesArray.map(async (primaryImageUrl) => {
          const response1 = await axios.get(primaryImageUrl, {
            responseType: "stream",
          });

          const primaryImageStream = response1.data;
          console.log(primaryImageStream);
          const primaryImagePath = `vehicles/${name}/${name}.jpg`; // Change as needed
          await minioClient.putObject(
            bucket,
            primaryImagePath,
            primaryImageStream,
            {
              "Content-Type": "jpg/jpeg/png" || "application/octet-stream", // Adjust as needed
            }
          );
          const primaryImage = `${minioPath}/${bucket}/${primaryImagePath}`;

          return primaryImage;
        })
      );
      console.log(otherImages);
      const modelData = await VehicleRepository.getModelByName({ model });

      console.log(modelData);
      const modelId = modelData[0].id;

      const manufacturerId = modelData[0]?.manufacturer.id;

      await VehicleRepository.createVehicle({
        name,
        description,
        price,
        seats,
        gear,
        fuelType,
        primaryImage,
        otherImages,
        availableQty,
        manufacturerId,
        modelId,
      });
    }

    return true;
  }

  /**
   * Retrieves all vehicles.
   *
   * @async
   * @returns {array} List of vehicles
   */
  static async getAllVehicles() {
    return await VehicleRepository.getAllVehicles();
  }

  /**
   * Retrieves all rentable vehicles.
   *
   * @async
   * @returns {array} List of rentable vehicles
   */
  static async getAllRentableVehicles() {
    return await VehicleRepository.getAllRentableVehicles();
  }

  /**
   * Retrieves a vehicle by its ID.
   *
   * @async
   * @param {number} id - Vehicle ID
   * @returns {object} Vehicle data
   */
  static async getVehicleById(id) {
    const vehicleId = id;
    return await VehicleRepository.getVehicleById(vehicleId);
  }

  /**
   * Deletes a vehicle and its associated images.
   *
   * @async
   * @param {object} data - Vehicle ID
   * @returns {boolean} True if deleted successfully
   */
  static async deleteVehicle({ id }) {
    const vehicle = await VehicleRepository.getVehicleById(id);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${id} does not exist.`);
    } else {
      const presignedUrl = vehicle.primaryImage; // Assuming 'primaryImage' contains the presigned URL
      const parsedUrl = new URL(presignedUrl);
      const objectPath = parsedUrl.pathname.replace("/motorent/", "");

      // Remove primary image from MinIO
      await minioClient.removeObject(bucket, objectPath);

      // Remove secondary image if it exists
      if (vehicle.secondaryImage) {
        const presignedUrl2 = vehicle.secondaryImage;
        const parsedUrl2 = new URL(presignedUrl2);
        const objectPath2 = parsedUrl2.pathname.replace("/motorent/", "");
        await minioClient.removeObject(bucket, objectPath2);
      }

      // Delete bookings related to the vehicle
      await VehicleRepository.deleteBookingsByVehicle({ id });

      // Delete vehicle from Prisma
      await VehicleRepository.deleteVehicle({ id });

      return true;
    }
  }

  /**
   * Searches vehicles based on query.
   *
   * @async
   * @param {string} query - Search query
   * @returns {array} List of vehicles
   */
  static async searchVehicles(query) {
    return await VehicleRepository.searchVehicles(query);
  }

  /**
   * Searches rentable vehicles based on query.
   *
   * @async
   * @param {string} query - Search query
   * @returns {array} List of rentable vehicles
   */
  static async searchRentableVehicles(query) {
    return await VehicleRepository.searchRentableVehicles(query);
  }

  /**
   * Retrieves all rentable vehicles sorted by specified order.
   *
   * @async
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {array} List of rentable vehicles
   */
  static async getAllRentableVehiclesSorted(sortOrder) {
    return await VehicleRepository.getAllRentableVehiclesSorted(sortOrder);
  }

  /**
   * Toggles rentable status of a vehicle.
   *
   * @async
   * @param {number} id - Vehicle ID
   * @returns {boolean} True if updated successfully
   */
  static async toggleRentable(id) {
    return await VehicleRepository.toggleRentable(id);
  }

  /**
   * Updates vehicle data with optional image uploads.
   *
   * @async
   * @param {object} data - Vehicle data
   * @param {file} primaryImageFile - Primary image file (optional)
   * @param {array} otherImageFiles - Other image files (optional)
   * @returns {object} Updated vehicle data
   */
  static async updateVehicle({ id, data, primaryImageFile, otherImageFiles }) {
    const schema = VehicleRequests.updateVehicleValidationSchema();
    const { error } = schema.validate(data);
    if (error) {
      throw new Error(`${error.details[0].message}`);
    }

    let primaryImage = null;
    if (primaryImageFile) {
      const { createReadStream, filename } = await primaryImageFile.promise;
      const stream = createReadStream();
      const filename1 = `vehicles/${data.name}/${filename}`;

      const mimeType = mime.contentType(filename);

      // Upload to MinIO
      await minioClient.putObject(bucket, filename1, stream, {
        "Content-Type": mimeType || "application/octet-stream", // Adjust as needed
      });

      // Save the image path and name to the database
      primaryImage = `${minioPath}/${bucket}/${filename1}`;
    }

    let otherImages = null;
    if (otherImageFiles && otherImageFiles.length > 0) {
      otherImages = [];
      otherImages = await Promise.all(
        otherImageFiles.map(async (file) => {
          const {
            createReadStream: createReadStreamPrimary,
            filename: filenamePrimary,
          } = await file.promise;

          // Upload file to MinIO
          const streamPrimary = createReadStreamPrimary();
          const mimeTypePrimary = mime.contentType(filenamePrimary);

          const filename1 = `vehicles/${data.name}/${filenamePrimary}`;

          // Upload to MinIO
          await minioClient.putObject(bucket, filename1, streamPrimary, {
            "Content-Type": mimeTypePrimary || "application/octet-stream", // Adjust as needed
          });

          // Save the image path and name to the database

          const image = `${minioPath}/${bucket}/${filename1}`;
          return image;
        })
      );
    }

    // Step 2: Update the vehicle in the database using Prisma
    return await VehicleRepository.updateVehicle({
      id,
      data,
      primaryImage,
      otherImages,
    });
  }
}

module.exports = VehicleController;
