const { gql } = require('apollo-server-express');


const userMutations = gql`
  type Mutation {
    updateUser(id: ID!, name: String!): User
    deleteUser(id: ID!): String
    addUser(name: String!): User
    registerCustomer(
      customerInput: CustomerInput
    ): Customer
    login(email: String!, password: String!): LoginResponse!
    addUserTest(name: String!, email: String!): UserTest
    uploadImageTest(name: String!, file: Upload!, extraFile: Upload!): Image!
  } 
`;

module.exports = userMutations;