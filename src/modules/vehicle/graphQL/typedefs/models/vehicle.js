const { gql } = require('apollo-server-express');

const vehicle = gql`

  scalar Upload

  type Manufacturer {
    id: ID!
    name: String!
    image: String
    models: [Model!]!  # Relation to Model
    vehicles: [Vehicle!]!  # Relation to Vehicle
  }
  
  type Model {
    id: ID!
    name: String!
    manufacturer: Manufacturer!  # Relation to Manufacturer
    vehicles: [Vehicle!]!  # Relation to Vehicle
  }
  
  type Vehicle {
    id: ID!
    name: String!
    description: String!
    price: Float!
    primaryImage: String!
    secondaryImage: String
    availableQty: Int!
    isRentable: Boolean!
    manufacturer: Manufacturer!  
    model: Model!  
  }

  input VehicleInput {
    name: String!
    description: String!
    price: Float!
    availableQty: Int!
  }

  type VehicleTypesense {
    id: ID!
    name: String!
    description: String!
    price: Float!
    primaryImage: String!
    secondaryImage: String
    availableQty: Int!
    isRentable: Boolean!
    manufacturerName: String!  
    modelName: String!  
  }
  
`;

module.exports = vehicle;
