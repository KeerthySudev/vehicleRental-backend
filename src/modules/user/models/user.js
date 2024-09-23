const { gql } = require('apollo-server-express');


const userSchema = gql`
  type Query {
    hello: String
    users: [User]
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
    password: String!
  }
`;

module.exports = userSchema;