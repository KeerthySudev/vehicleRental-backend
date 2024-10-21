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
      gear: String
    fuelType: String
    seats: Int
      description: String!
      price: Float!
      primaryImageFile: Upload!
      availableQty: Int!
      manufacturerId: Int!
      modelId: Int!
      otherImageFiles: [Upload]
    ): VehicleTest!

    updateVehicle(
      id: Int!
      data: VehicleInput
      primaryImageFile: Upload
      otherImageFiles: [Upload]
    ): VehicleTest!

    deleteVehicle(id: Int!): Boolean!
    
    importVehicles(file: Upload): Boolean!

    toggleRentable(id: Int!): Vehicle!

    createTest(
      name: String!
      otherImageFiles: [Upload]
    ): Test!
  }
`;

module.exports = vehicleMutations;
