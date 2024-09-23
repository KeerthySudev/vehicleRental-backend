const express = require('express');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const userSchema = require('./modules/user/models/user');
const userResolvers = require('./modules/user/controllers/userController');
const vehicleSchema = require('./modules/vehicle/models/vehicle');
const vehicleResolvers = require('./modules/vehicle/repositories/vehicleRepository');
const app = express();

const cors = require('cors');
app.use(cors());

const typeDefs = [userSchema, vehicleSchema];
const resolvers = [userResolvers, vehicleResolvers];

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

const startServer = async () => {
  // Start the Apollo Server
  await server.start();

  // Apply middleware to the Express app
  server.applyMiddleware({ app });

  // Start the Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();
