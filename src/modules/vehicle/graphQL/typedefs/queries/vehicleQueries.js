const { gql } = require("apollo-server-express");

const vehicleQueries = gql`
  extend type Query {
    getAllManufacturers: [Manufacturer!]!
    getAllModels: [Model!]!
    getModelsByManufacturer(manufacturerId: Int!): [Model!]!
    getAllVehicles: [Vehicle!]!
    getAllRentableVehicles: [Vehicle!]!
    getVehicleById(id: Int!): VehicleTest
    searchVehicles(query: String!): [VehicleTypesense]
    searchRentableVehicles(query: String!): [VehicleTypesense]
    getAllRentableVehiclesSorted(sortOrder: String): [VehicleTypesense!]!
  }
`;

module.exports = vehicleQueries;
