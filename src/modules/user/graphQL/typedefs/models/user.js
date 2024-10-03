const { gql } = require('apollo-server-express');


const user = gql`

scalar Upload

  type LoginResponse {
    token: String
    user: Customer
  }

  input CustomerInput {
    name: String!
    email: String!
    phone: String!
    city: String!
    state: String!
    country: String!
    pincode: String!
    password: String!
    confirmPassword: String!
  }
  
  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: String!
    city: String!
    state: String!
    country: String!
    pincode: String!
    role: String!
    image: String
  }
`;

module.exports = user;