const { gql } = require("apollo-server-express");

const bookingMutations = gql`

  extend type Mutation {

      createBooking(input: BookingInput!): BookingPaymentResponse!
      updateBookingPayment(id: Int!, razorpayPaymentId: String!, razorpaySignature: String!): Booking
  }
`;

module.exports = bookingMutations;
