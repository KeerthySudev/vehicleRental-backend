const { gql } = require("apollo-server-express");

const vehicleMutations = gql`
  extend type Mutation {
    addVehicle(
      name: String!
      description: String!
      price: Float!
      available_quantity: Int!
    ): VehicleTest
    updateVehicle(
      id: ID!
      name: String!
      description: String!
      price: Float!
      primary_image: String
      other_images: [String]
      available_quantity: Int!
    ): Vehicle
    deleteVehicle(id: ID!): String
    createVehicle(
      name: String!
      description: String!
      price: Float!
      primaryImageFile: Upload!
      secondaryImageFile: Upload! 
      availableQty: Int!
      manufacture: String!
      model: String!
    ): Vehicle!
  }
`;

module.exports = vehicleMutations;
