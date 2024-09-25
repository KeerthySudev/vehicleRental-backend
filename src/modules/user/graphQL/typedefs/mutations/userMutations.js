const { gql } = require('apollo-server-express');
const user = require('../models/user');


const userMutations = gql`
  type Mutation {
    updateUser(id: ID!, name: String!): User
    deleteUser(id: ID!): String
    addUser(name: String!): User
    registerCustomer(
      customerInput: CustomerInput
    ): Customer
    login(email: String!, password: String!): LoginResponse!
  } 
`;

module.exports = userMutations;