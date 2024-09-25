const express = require('express');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const userSchema = require('./modules/user/graphQL/userSchema');
const userResolvers = require('./modules/user/controllers/userController');
const vehicleSchema = require('./modules/vehicle/models/vehicle');
const {vehicleResolvers} = require('./modules/vehicle/controllers/vehicleController');
const app = express();
// const imageRoutes = require('../src/routes/route');


const cors = require('cors');
app.use(cors());
// app.use('/api', imageRoutes);

const typeDefs = [userSchema.typeDefs, vehicleSchema];
const resolvers = [userSchema.resolvers, vehicleResolvers];

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
