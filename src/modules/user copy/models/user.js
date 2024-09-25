const { gql } = require('apollo-server-express');


const userSchema = gql`
  type Query {
    hello: String
    users: [User]
    customers : [Customer]
    customer(email: String!): Customer
  }
  type User {
    id: ID!
    name: String!
  }
  type Mutation {
    updateUser(id: ID!, name: String!): User
    deleteUser(id: ID!): String
    addUser(name: String!): User
    registerCustomer(
      customerInput: CustomerInput
    ): Customer
    login(email: String!, password: String!): LoginResponse!
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
`;

module.exports = userSchema;