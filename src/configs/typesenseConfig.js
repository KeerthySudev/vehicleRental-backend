const Typesense = require('typesense');

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,      
      port: 443,          
      protocol: 'https',       
    }
  ],
  apiKey: process.env.TYPESENSE_API_KEY,    
  connectionTimeoutSeconds: 2
});


// const schema = {
//     'name': 'vehicles',
//     'fields': [
//       { 'name': 'name', 'type': 'string' },
//       { 'name': 'manufacturer', 'type': 'string' },
//       { 'name': 'model', 'type': 'string' },
//       { 'name': 'price', 'type': 'float' },
//       { 'name': 'pickupLocation', 'type': 'string' },
//       { 'name': 'dropoffLocation', 'type': 'string' }
//     ],
//     'default_sorting_field': 'price'
//   };

const vehicleSchema = {
    name: 'vehicles', 
    fields: [
      { name: 'id', type: 'int32' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'primaryImage', type: 'string' },
      { name: 'secondaryImage', type: 'string', optional: true },
      { name: 'isRentable', type: 'bool' },
      { name: 'availableQty', type: 'int32' },
  
      { name: 'manufacturerName', type: 'string', facet: true },

      { name: 'modelName', type: 'string', facet: true },
  
      // Sort by price or other fields
      { name: 'price', type: 'float', facet: true }
    ],
    default_sorting_field: 'price'
  };
  

//   client.collections('vehicles').retrieve()
//   .then(response => {
//     console.log('Collection already exists:', response);
//   })
//   .catch(error => {
//     // If the collection doesn't exist, create it
//     if (error.httpStatus === 404) {
//       client.collections().create(vehicleSchema)
//         .then(response => console.log('Collection created:', response))
//         .catch(err => console.error('Error creating collection:', err));
//     }
//   });

  const vehicle = {
    id: '1',  // Every document needs a unique ID
    name: 'SUV',
    manufacturerName: 'Toyota',
    modelName: 'Highlander',
    price: 5000,
    description: 'New York',
    primaryImage: 'Los Angeles',
    secondaryImage: 'Los Angeles',
    isRentable: false,
    availableQty:5,
  };
  
  const createCollection = () => client.collections('vehicles').documents().create(vehicle)
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });

  module.exports = client;

  
//   client.collections().create(vehicleSchema)
//     .then(function(response) {
//       console.log(response);
//     })
//     .catch(function(error) {
//       console.error(error);
//     });
  
