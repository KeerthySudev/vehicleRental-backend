const { gql } = require('apollo-server-express');


const bookingQueries = gql`

extend type Query {
  getAllBookings: [Booking!]!
  getBookingById(id: Int!): Booking
  getBookingsByUser(customerId: Int!):  [Booking!]!
}
`;

module.exports = bookingQueries;