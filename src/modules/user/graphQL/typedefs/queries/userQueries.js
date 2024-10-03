const { gql } = require('apollo-server-express');


const userQueries = gql`
  type Query {
    customers : [Customer]
    customer(id: Int!): Customer
  }
`;

module.exports = userQueries;