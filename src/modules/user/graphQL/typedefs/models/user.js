const { gql } = require('apollo-server-express');


const user = gql`

scalar Upload

  type User {
    id: ID!
    name: String!
  }
  type LoginResponse {
    token: String
    user: Customer
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String!
    city: String
    state: String
    country: String
    pincode: String
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
  }

  type UserTest {
    id: ID!
    name: String!
    email: String!
  }

  type Image {
    id: ID!
    name: String!
    path: String!
    extraPath : String
  }
`;

module.exports = user;