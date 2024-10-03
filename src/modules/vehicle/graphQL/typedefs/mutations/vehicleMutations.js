const { gql } = require("apollo-server-express");

const vehicleMutations = gql`

  extend type Mutation {

    createManufacturer(name: String!, imageFile: Upload): Manufacturer!
    deleteManufacturer(id: Int!): Boolean!
  
    createModel(name: String!, manufacturerId: Int!): Model!
    deleteModel(id: Int!): Boolean!
  
    createVehicle(name: String!, description: String!, price: Float!, primaryImageFile: Upload!, secondaryImageFile: Upload, availableQty: Int!, manufacturerId: Int!, modelId: Int!): Vehicle!
    updateVehicle(id: Int!, name: String!, description: String!, price: Float!, primaryImage: String!, secondaryImage: String, availableQty: Int!, manufacturerId: Int!, modelId: Int!): Vehicle!
    deleteVehicle(id: Int!): Boolean!

    toggleRentable(id: Int!): Vehicle!
  }
`;

module.exports = vehicleMutations;
