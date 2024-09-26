const { gql } = require('apollo-server-express');

const vehicle = gql`

  type VehicleX {
    id: ID!
    name: String!
    description: String!
    price: Float!
    primary_image: String
    other_images: [String]
    available_quantity: Int!
  }

  type VehicleTest {
    id: ID!
    name: String!
    description: String!
    price: Float!
    available_quantity: Int!
  }

  scalar Upload
  
  type Vehicle {
    id: ID!
    name: String!
    description: String!
    price: Float!
    primaryImage: String!
    secondaryImage: String!
    availableQty: Int!
    manufacture: String!
    model: String!
  }



`;

module.exports = vehicle;
