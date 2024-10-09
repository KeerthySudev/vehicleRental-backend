const express = require('express');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const userSchema = require('./modules/user/graphQL/userSchema');
const vehicleSchema = require('./modules/vehicle/graphQL/vehicleSchema');
const bookingSchema = require('./modules/booking/graphQL/bookingSchema');
const app = express();
const { graphqlUploadExpress } = require('graphql-upload');
const createCollection = require('././configs/typesenseConfig');


const cors = require('cors');
app.use(cors());
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));


// createCollection();
const typeDefs = [userSchema.typeDefs, vehicleSchema.typeDefs, bookingSchema.typeDefs];
const resolvers = [userSchema.resolvers, vehicleSchema.resolvers, bookingSchema.resolvers];

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
