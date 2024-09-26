
const { mergeTypeDefs } = require('@graphql-tools/merge');
const vehicleModel = require('./typedefs/models/vehicle');
const vehicleQueries = require('./typedefs/queries/vehicleQueries');
const vehicleMutations = require('./typedefs/mutations/vehicleMutations');
const resolvers = require('./resolvers/vehicleResolver');

// Combine the schemas using mergeTypeDefs
const typeDefs = mergeTypeDefs([vehicleModel, vehicleQueries, vehicleMutations]);

module.exports = {typeDefs, resolvers};
