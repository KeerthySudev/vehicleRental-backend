const { gql } = require('apollo-server-express');


const vehicleQueries = gql`
extend type Query {
  vehicles: [VehicleTest]
  vehicle(id: ID!): VehicleTest
  images: [Image]
  getAllVehicles: [Vehicle!]!
  getVehicleById(id: ID!): Vehicle
}
`;

module.exports = vehicleQueries;