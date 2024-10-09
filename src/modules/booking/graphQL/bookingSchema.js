
const { mergeTypeDefs } = require('@graphql-tools/merge');
const bookingModel = require('./typedefs/models/booking');
const bookingQueries = require('./typedefs/queries/bookingQueries');
const bookingMutations = require('./typedefs/mutations/bookingMutations');
const resolvers = require('./resolvers/bookingResolver');

// Combine the schemas using mergeTypeDefs
const typeDefs = mergeTypeDefs([bookingModel, bookingQueries, bookingMutations]);

module.exports = {typeDefs, resolvers};
