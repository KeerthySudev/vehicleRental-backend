const { gql } = require('apollo-server-express');


const userQueries = gql`
  type Query {
    hello: String
    users: [User]
    customers : [Customer]
    customer(email: String!): Customer
  }
`;

module.exports = userQueries;