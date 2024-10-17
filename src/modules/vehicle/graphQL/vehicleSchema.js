
const { mergeTypeDefs } = require('@graphql-tools/merge');
const vehicleModel = require('./typedefs/models/vehicle');
const vehicleQueries = require('./typedefs/queries/vehicleQueries');
const vehicleMutations = require('./typedefs/mutations/vehicleMutations');
const resolvers = require('./resolvers/vehicleResolver');

const typeDefs = mergeTypeDefs([vehicleModel, vehicleQueries, vehicleMutations]);

module.exports = {typeDefs, resolvers};
