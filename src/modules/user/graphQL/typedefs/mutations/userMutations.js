const { gql } = require("apollo-server-express");

const userMutations = gql`
  type Mutation {
    updateCustomer(
      id: Int!
      data: UpdateCustomerInput
      imageFile: Upload
    ): Customer!
    validateCustomer(customerInput: CustomerInput): Boolean
    registerCustomer(customerInput: CustomerInput): Customer
    login(email: String!, password: String!): LoginResponse!
    changePassword(id: Int!, password: String!, newPassword: String!, confirmPassword: String!): Customer
    sendVerification(phoneNumber: String!): String!
    verifyCode(phoneNumber: String!, code: String!): String!
  }
`;

module.exports = userMutations;
