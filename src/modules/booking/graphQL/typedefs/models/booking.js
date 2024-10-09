const { gql } = require('apollo-server-express');

const booking = gql`

  scalar DateTime

  type Booking {
    id: Int!
    pickupDate: String!  # Storing date as String in YYYY-MM-DD format
    pickupTime: String!   # Time in 'hh:mm AM/PM' format
    dropoffDate: String!  # Storing date as String in YYYY-MM-DD format
    dropoffTime: String!   # Time in 'hh:mm AM/PM' format
    status: String!
    pickupLocation: String!
    dropoffLocation: String!
    paymentStatus: String!
    amount: Float!
    razorpayPaymentId: String
    razorpaySignature: String
    vehicle: Vehicle
    customerId: Int!
    createdAt: String!    # Storing createdAt as String in ISO format
  }
  

  input BookingInput {
    pickupDate: String!     
    pickupTime: String!     
    dropoffDate: String!     
    dropoffTime: String!          
    pickupLocation: String!   
    dropoffLocation: String!
    amount: Float!         
    vehicleId: Int!          
    customerId: Int!          
  }
  
  type BookingPaymentResponse {
    id: Int!
    razorpayOrderId: String!
    amount: Float!
    currency: String!
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

`;

module.exports = booking;
