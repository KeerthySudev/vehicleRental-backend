
const { mergeTypeDefs } = require('@graphql-tools/merge');
const userModel = require('./typedefs/models/user');
const userQueries = require('./typedefs/queries/userQueries');
const userMutations = require('./typedefs/mutations/userMutations');
const resolvers = require('./resolvers/userResolver')

// Combine the schemas using mergeTypeDefs
const typeDefs = mergeTypeDefs([userModel, userQueries, userMutations]);

module.exports = {typeDefs, resolvers};
