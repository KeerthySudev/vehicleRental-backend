const VehicleController = require("../../controllers/vehicleController");

const vehicleResolvers = {
  Query: {
    /**
     * Get all vehicle manufacturers
     *
     * @async
     * @returns {array} List of manufacturers
     */
    getAllManufacturers: async () => {
      return await VehicleController.getAllManufacturers();
    },

    /**
     * Get all vehicle models
     *
     * @async
     * @returns {array} List of models
     */
    getAllModels: async () => {
      return await VehicleController.getAllModels();
    },

    /**
     * Get models by manufacturer ID
     *
     * @async
     * @param {number} manufacturerId - Manufacturer ID
     * @returns {array} List of models
     */
    getModelsByManufacturer: async (_, { manufacturerId }) => {
      return await VehicleController.getModelsByManufacturer(manufacturerId);
    },

    /**
     * Get all vehicles
     *
     * @async
     * @returns {array} List of vehicles
     */
    getAllVehicles: async () => {
      return await VehicleController.getAllVehicles();
    },

    /**
     * Get all rentable vehicles
     *
     * @async
     * @returns {array} List of rentable vehicles
     */
    getAllRentableVehicles: async () => {
      return await VehicleController.getAllRentableVehicles();
    },

    /**
     * Get vehicle by ID
     *
     * @async
     * @param {number} id - Vehicle ID
     * @returns {object} Vehicle data
     */
    getVehicleById: async (_, { id }) => {
      return await VehicleController.getVehicleById(id);
    },

    /**
     * Search vehicles by query
     *
     * @async
     * @param {string} query - Search query
     * @returns {array} List of vehicles
     */
    searchVehicles: async (_, { query }) => {
      return await VehicleController.searchVehicles(query);
    },

    /**
     * Search rentable vehicles by query
     *
     * @async
     * @param {string} query - Search query
     * @returns {array} List of rentable vehicles
     */
    searchRentableVehicles: async (_, { query }) => {
      return await VehicleController.searchRentableVehicles(query);
    },

    /**
     * Get all rentable vehicles sorted by specified order
     *
     * @async
     * @param {string} sortOrder - Sort order (asc/desc)
     * @returns {array} List of rentable vehicles
     */
    getAllRentableVehiclesSorted: async (_, { sortOrder = "asc" }) => {
      return await VehicleController.getAllRentableVehiclesSorted(sortOrder);
    },
  },
  Mutation: {
    /**
     * Toggle rentable status of a vehicle
     *
     * @async
     * @param {number} id - Vehicle ID
     * @returns {boolean} True if updated successfully
     */
    toggleRentable: async (_, { id }) => {
      return await VehicleController.toggleRentable(id);
    },

    /**
     * Create a new manufacturer
     *
     * @async
     * @param {string} name - Manufacturer name
     * @param {file} imageFile - Manufacturer image file
     * @returns {object} Created manufacturer data
     */
    createManufacturer: async (_, { name, imageFile }) => {
      return await VehicleController.createManufacturer({ name, imageFile });
    },

    /**
     * Import manufacturers from a file
     *
     * @async
     * @param {file} file - File containing manufacturer data
     * @returns {boolean} True if imported successfully
     */
    importManufacturers: async (_, { file }) => {
      return await VehicleController.importManufacturers({ file });
    },

    /**
     * Import vehicles from a file
     *
     * @async
     * @param {file} file - File containing vehicle data
     * @returns {boolean} True if imported successfully
     */
    importVehicles: async (_, { file }) => {
      return await VehicleController.importVehicles({ file });
    },

    /**
     * Delete a manufacturer
     *
     * @async
     * @param {number} id - Manufacturer ID
     * @returns {boolean} True if deleted successfully
     */
    deleteManufacturer: async (_, { id }) => {
      return await VehicleController.deleteManufacturer({ id });
    },

    /**
     * Create a new model
     *
     * @async
     * @param {string} name - Model name
     * @param {number} manufacturerId - Manufacturer ID
     * @returns {object} Created model data
     */
    createModel: async (_, { name, manufacturerId }) => {
      return await VehicleController.createModel({ name, manufacturerId });
    },

    /**
     * Delete a model
     *
     * @async
     * @param {number} id - Model ID
     * @returns {boolean} True if deleted successfully
     */
    deleteModel: async (_, { id }) => {
      return await VehicleController.deleteModel({ id });
    },

    /**
     * Update a vehicle
     *
     * @async
     * @param {number} id - Vehicle ID
     * @param {object} data - Vehicle data
     * @param {file} primaryImageFile - Primary image file (optional)
     * @param {array} otherImageFiles - Other image files (optional)
     * @returns {object} Updated vehicle data
     */
    updateVehicle: async (
      _,
      { id, data, primaryImageFile, otherImageFiles }
    ) => {
      return await VehicleController.updateVehicle({
        id,
        data,
        primaryImageFile,
        otherImageFiles,
      });
    },

    /**
     * Delete a vehicle
     *
     * @async
     * @param {number} id - Vehicle ID
     * @returns {boolean} True if deleted successfully
     */
    deleteVehicle: async (_, { id }) => {
      return await VehicleController.deleteVehicle({ id });
    },

    /**
     * Create a new vehicle
     *
     * @async
     * @param {string} name - Vehicle name
     * @param {string} description - Vehicle description
     * @param {number} price - Vehicle price
     * @param {file} primaryImageFile - Primary image file
     * @param {array} otherImageFiles - Other image files
     * @param {number} availableQty - Available quantity
     * @param {number} manufacturerId - Manufacturer ID
     * @param {number} modelId - Model ID
     * @param {number} seats - Number of seats
     * @param {string} gear - Gear type
     * @param {string} fuelType - Fuel type
     * @returns {object} Created vehicle data
     */
    createVehicle: async (
      _,
      {
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
      }
    ) => {
      return await VehicleController.createVehicle({
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
      });
    },
  },
};

module.exports = vehicleResolvers;
