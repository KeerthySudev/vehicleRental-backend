const { gql } = require('apollo-server-express');


const bookingQueries = gql`

extend type Query {
  getAllBookings: [Booking!]!
  getBookingById(id: Int!): Booking
  getBookingsByUser(customerId: Int!):  [Booking!]!
  exportAllBookings: String!
  exportBooking(id: Int!): String!
}
`;

module.exports = bookingQueries;