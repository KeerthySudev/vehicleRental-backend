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

  type VehicleTest {
    id: ID!
    name: String!
    description: String!
    price: Float!
    available_quantity: Int!
  }

  scalar Upload

  extend type Query {
    hello: String
    vehicles: [VehicleTest]
    vehicle(id: ID!): VehicleTest
    images: [Image]
  }

  extend type Mutation {
    
    addVehicle(name: String!, description: String!, price: Float!,  available_quantity: Int!): VehicleTest
    updateVehicle(id: ID!, name: String!, description: String!, price: Float!, primary_image: String, other_images: [String], available_quantity: Int!): Vehicle
    deleteVehicle(id: ID!): String
    uploadImage(name: String!, file: Upload!): Image!
  }

  type Image {
    id: ID!
    name: String!
    image_path: String!
}


`;

module.exports = vehicleSchema;
