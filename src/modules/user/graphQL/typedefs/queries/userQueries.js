const { gql } = require('apollo-server-express');


const userQueries = gql`
  type Query {
    customer(id: Int!): Customer
  }
`;

module.exports = userQueries;