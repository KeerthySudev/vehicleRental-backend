const { gql } = require('apollo-server-express');

const vehicleSchema = gql`

  type Vehicle {
    id: ID!
    name: String!
    description: String!
    price: Float!
    primary_image: String
    other_images: [String]
    available_quantity: Int!
  }

  extend type Query {
    hello: String
    vehicles: [Vehicle]
    vehicle(id: ID!): Vehicle
  }

  extend type Mutation {
    
    addVehicle(name: String!, description: String!, price: Float!, primary_image: String, other_images: [String], available_quantity: Int!): Vehicle
    updateVehicle(id: ID!, name: String!, description: String!, price: Float!, primary_image: String, other_images: [String], available_quantity: Int!): Vehicle
    deleteVehicle(id: ID!): String
  }
`;

module.exports = vehicleSchema;
