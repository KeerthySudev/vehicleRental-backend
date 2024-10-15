const { gql } = require('apollo-server-express');


const userMutations = gql`
  type Mutation {
    updateCustomer(id: Int!, data: CustomerInput, imageFile: Upload): Customer!
    deleteUser(id: ID!): String
    validateCustomer(
      customerInput: CustomerInput
    ): Boolean
    registerCustomer(
      customerInput: CustomerInput
    ): Customer
    login(email: String!, password: String!): LoginResponse!

    sendVerification(phoneNumber: String!): String!
  verifyCode(phoneNumber: String!, code: String!): String!
  } 
`;

module.exports = userMutations;