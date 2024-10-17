const VehicleController = require("../../controllers/vehicleController");

const vehicleResolvers = {
  Query: {
    getAllManufacturers: async () => {
      return await VehicleController.getAllManufacturers();
    },

    getAllModels: async () => {
      return await VehicleController.getAllModels();
    },

    getModelsByManufacturer: async (_, { manufacturerId }) => {
      return await VehicleController.getModelsByManufacturer(manufacturerId);
    },
    getAllVehicles: async () => {
      return await VehicleController.getAllVehicles();
    },

    getAllRentableVehicles: async () => {
      return await VehicleController.getAllRentableVehicles();
    },

    getVehicleById: async (_, { id }) => {
      return await VehicleController.getVehicleById(id);
    },
    searchVehicles: async (_, { query }) => {
      return await VehicleController.searchVehicles(query);
    },
    searchRentableVehicles: async (_, { query }) => {
      return await VehicleController.searchRentableVehicles(query);
    },
    getAllRentableVehiclesSorted: async (_, { sortOrder = "asc" }) => {
      return await VehicleController.getAllRentableVehiclesSorted(sortOrder);
    },
  },
  Mutation: {
    toggleRentable: async (_, { id }) => {
      return await VehicleController.toggleRentable(id);
    },

    createManufacturer: async (_, { name, imageFile }) => {
      return await VehicleController.createManufacturer({ name, imageFile });
    },

    importManufacturers: async (_, { file }) => {
      return await VehicleController.importManufacturers({ file });
    },

    importVehicles: async (_, { file }) => {
      return await VehicleController.importVehicles({ file });
    },
    deleteManufacturer: async (_, { id }) => {
      return await VehicleController.deleteManufacturer({ id });
    },

    createModel: async (_, { name, manufacturerId }) => {
      return await VehicleController.createModel({ name, manufacturerId });
    },
    deleteModel: async (_, { id }) => {
      return await VehicleController.deleteModel({ id });
    },
    updateVehicle: async (
      _,
      { id, data, primaryImageFile, secondaryImageFile }
    ) => {
      return await VehicleController.updateVehicle({
        id,
        data,
        primaryImageFile,
        secondaryImageFile,
      });
    },

    deleteVehicle: async (_, { id }) => {
      return await VehicleController.deleteVehicle({ id });
    },

    createVehicle: async (
      _,
      {
        name,
        description,
        price,
        primaryImageFile,
        secondaryImageFile,
        availableQty,
        manufacturerId,
        modelId,
      }
    ) => {
      return await VehicleController.createVehicle({
        name,
        description,
        price,
        primaryImageFile,
        secondaryImageFile,
        availableQty,
        manufacturerId,
        modelId,
      });
    },
  },
};

module.exports = vehicleResolvers;
