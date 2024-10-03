const { gql } = require('apollo-server-express');


const userMutations = gql`
  type Mutation {
    updateCustomer(id: Int!, data: CustomerInput, imageFile: Upload): Customer!
    deleteUser(id: ID!): String
    registerCustomer(
      customerInput: CustomerInput
    ): Customer
    login(email: String!, password: String!): LoginResponse!
  } 
`;

module.exports = userMutations;