const { gql } = require('apollo-server-express');


const userQueries = gql`
  type Query {
    users: [User]
    customers : [Customer]
    customer(email: String!): Customer
    usersTest: [UserTest!]!
    getImage(id: ID!): Image
    getAllImages: [Image]
  }
`;

module.exports = userQueries;