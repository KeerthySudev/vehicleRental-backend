const { gql } = require("apollo-server-express");

const vehicleMutations = gql`
  extend type Mutation {
    createManufacturer(name: String!, imageFile: Upload): Manufacturer!

    deleteManufacturer(id: Int!): Boolean!

    importManufacturers(file: Upload): Boolean!

    createModel(name: String!, manufacturerId: Int!): Model!

    deleteModel(id: Int!): Boolean!

    createVehicle(
      name: String!
      description: String!
      price: Float!
      primaryImageFile: Upload!
      secondaryImageFile: Upload
      availableQty: Int!
      manufacturerId: Int!
      modelId: Int!
    ): Vehicle!

    updateVehicle(
      id: Int!
      data: VehicleInput
      primaryImageFile: Upload
      secondaryImageFile: Upload
    ): Vehicle!

    deleteVehicle(id: Int!): Boolean!
    
    importVehicles(file: Upload): Boolean!

    toggleRentable(id: Int!): Vehicle!
  }
`;

module.exports = vehicleMutations;
