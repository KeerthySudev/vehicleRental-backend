const prisma = require("../../../configs/prisma/prismaConfig");
const typesenseClient = require("../../../configs/typesense/typesenseConfig");

class VehicleRepository {
  static async getAllManufacturers() {
    return await prisma.manufacturer.findMany({
      include: {
        models: true,
        vehicles: true,
      },
    });
  }

  static async getAllModels() {
    return await prisma.model.findMany({
      include: {
        manufacturer: true, 
        vehicles: true, 
      },
    });
  }

  static async createModel({ name, manufacturerId }) {
    return await prisma.model.create({
      data: {
        name,
        manufacturer: {
          connect: { id: manufacturerId },
        },
      },
    });
  }

  static async deleteModel({ id }) {
    await prisma.model.delete({
      where: { id },
    });
    return true;
  }

  static async createManufacturer({ name, image }) {
    return await prisma.manufacturer.create({
      data: {
        name,
        image,
      },
    });
  }

  static async getManufacturerById({ id }) {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
    });
    return manufacturer;
  }

  static async getModelsByManufacturer(manufacturerId) {
    const models = await prisma.model.findMany({ where: { manufacturerId } });
    return models;
  }

  static async getModelByName({ model }) {
    return await prisma.model.findMany({
      where: { name: model },
      include: {
        manufacturer: true,
      },
    });
  }

  static async deleteManufacturer({ id }) {
    return await prisma.manufacturer.delete({
      where: { id },
    });
  }

  static async createVehicle({
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
  }) {
    const foundManufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!foundManufacturer) {
      throw new Error("Manufacturer not found");
    }

    const foundModel = await prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!foundModel) {
      throw new Error("Model not found");
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
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
      },
      include: {
        manufacturer: true, 
        model: true, 
      },
    });

    try {
      const vehicle = {
        id: newVehicle.id.toString(), // Typesense requires string IDs
        name: newVehicle.name,
        description: newVehicle.description,
        price: newVehicle.price,
        availableQty: newVehicle.availableQty,
        manufacturerName: foundManufacturer.name, // Include manufacturer name
        modelName: foundModel.name, // Include model name
        primaryImage: newVehicle.primaryImage,
        secondaryImage: null,
        isRentable: false,
      };

      // Add the document to the Typesense collection
      const result = await typesenseClient
        .collections("vehicles")
        .documents()
        .create(vehicle);
    } catch (error) {
      console.error("Error adding document to Typesense:", error);
    }
    return newVehicle;
  }

  static async getAllVehicles() {
    return await prisma.vehicle.findMany({
      include: {
        manufacturer: true, // Include the manufacturer associated with the vehicle
        model: true, // Include the model associated with the vehicle
      },
    });
  }

  static async getAllRentableVehicles() {
    return await prisma.vehicle.findMany({
      where: { isRentable: true, availableQty: { gt: 0 } },
      include: {
        manufacturer: true, // Include the manufacturer associated with the vehicle
        model: true, // Include the model associated with the vehicle
      },
    });
  }

  static async getVehicleById(id) {
    console.log("id", id);
    return await prisma.vehicle.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        model: true,
      },
    });
  }

  static async deleteVehicle({ id }) {
    await prisma.vehicle.delete({
      where: { id: Number(id) },
    });

    // Delete vehicle from Typesense
    try {
      await typesenseClient
        .collections("vehicles")
        .documents(id.toString())
        .delete(); // Ensure id is passed as string
      console.log(`Vehicle with ID ${id} deleted from Typesense.`);
    } catch (error) {
      console.error(`Error deleting vehicle from Typesense: ${error}`);
    }

    return true;
  }

  static async deleteBookingsByVehicle({ id }) {
    const bookings = await prisma.booking.findMany({
      where: { vehicleId: Number(id) },
    });

    if (bookings.length > 0) {
      await prisma.booking.deleteMany({
        where: { vehicleId: Number(id) },
      });
    }

    return true;
  }

  static async toggleRentable(id) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: id },
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
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
      throw new Error("Manufacturer not found");
    }

    const foundModel = await prisma.model.findUnique({
      where: { id: vehicle.modelId },
    });

    if (!foundModel) {
      throw new Error("Model not found");
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
      manufacturerName: foundManufacturer.name, // Flattened
      modelName: foundModel.name, // Flattened
    };

    await typesenseClient
      .collections("vehicles")
      .documents()
      .upsert(updatedTypesenseDocument);

    return updatedVehicle;
  }

  static async searchVehicles(query) {
    const searchParameters = {
      q: query,
      query_by: "name,description,manufacturerName, modelName",
    };

    try {
      const result = await typesenseClient
        .collections("vehicles")
        .documents()
        .search(searchParameters);
      return result.hits.map((hit) => ({
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
      console.error("Error searching vehicles:", error);
      throw new Error("Search failed. Please try again later.");
    }
  }

  static async searchRentableVehicles(query) {
    const searchParameters = {
      q: query,
      query_by: "name,description,manufacturerName,modelName", // Ensure no typo here
    };

    try {
      // Execute the search query
      const result = await typesenseClient
        .collections("vehicles")
        .documents()
        .search(searchParameters);

      // Log the entire result to ensure hits are returned
      console.log("Search result:", result);

      // Process the hits and map to your vehicle structure
      const filteredResults = result.hits
        .map((hit) => {
          console.log("Hit document:", hit.document); // Log each hit to check fields
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
        .filter((vehicle) => {
          console.log("Filtering vehicle:", vehicle); // Log each vehicle before filtering
          return vehicle.availableQty > 0 && vehicle.isRentable;
        });

      // Log filtered results
      console.log("Filtered Results:", filteredResults);

      return filteredResults;
    } catch (error) {
      // Handle and log any errors
      console.error("Error searching vehicles:", error);
      throw new Error("Search failed. Please try again later.");
    }
  }

  static async getAllRentableVehiclesSorted(sortOrder) {
    try {
      if (sortOrder) {
        const searchResults = await typesenseClient
          .collections("vehicles") // Use your Typesense collection
          .documents()
          .search({
            q: "*", // Query all documents
            sort_by: `price:${sortOrder}`, // Sort by price
          });
        const filteredResults = searchResults.hits
          .map((hit) => hit.document)
          .filter((vehicle) => {
            return vehicle.availableQty > 0 && vehicle.isRentable;
          });
        // Return the search results in GraphQL-compatible format
        return filteredResults;
      } else {
        const searchResults = await typesenseClient
          .collections("vehicles") // Use your Typesense collection
          .documents()
          .search({
            q: "*",
          });

        const filteredResults = searchResults.hits
          .map((hit) => hit.document)
          .filter((vehicle) => {
            return vehicle.availableQty > 0 && vehicle.isRentable;
          });
        // Return the search results in GraphQL-compatible format
        return filteredResults;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateVehicle({ id, data, primaryImage, otherImages }) {
    console.log("data", primaryImage, otherImages);
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        availableQty: data.availableQty,
        seats: data.seats,
        fuelType: data.fuelType,
        gear: data.gear,
        ...(primaryImage && { primaryImage }),
        ...(otherImages && { otherImages }), // Update the image URL if an image was uploaded
      },
      include: {
        manufacturer: true,
        model: true,
      },
    });
    console.log("repo", updatedVehicle);

    const updatedTypesenseDocument = {
      id: String(updatedVehicle.id), // Convert id to string for Typesense
      name: updatedVehicle.name,
      description: updatedVehicle.description,
      price: updatedVehicle.price,
      availableQty: updatedVehicle.availableQty,
      isRentable: updatedVehicle.isRentable, // Use updated value
      primaryImage: updatedVehicle.primaryImage,
      secondaryImage: updatedVehicle.secondaryImage,
      manufacturerName: updatedVehicle.manufacturer.name, // Flattened
      modelName: updatedVehicle.model.name, // Flattened
    };

    await typesenseClient
      .collections("vehicles")
      .documents()
      .upsert(updatedTypesenseDocument);

    return updatedVehicle;
  }

}

module.exports = VehicleRepository;
