const pool = require('../../../configs/dbConfig');

const vehicleResolvers = {
  Query: {
    hello: () => 'Hello, Vehicle Rental Management!',
    vehicles: async () => {
      const result = await pool.query('SELECT * FROM vehicles');
      return result.rows;
    },
    vehicle: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
      return result.rows[0];
    },
  },
  Mutation: {
    addVehicle: async (_, { name, description, price, primary_image, other_images, available_quantity }) => {
      const result = await pool.query(
        'INSERT INTO vehicles (name, description, price, primary_image, other_images, available_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, price, primary_image, other_images, available_quantity]
      );
      return result.rows[0];
    },
    updateVehicle: async (_, { id, name, description, price, primary_image, other_images, available_quantity }) => {
      const result = await pool.query(
        'UPDATE vehicles SET name = $1, description = $2, price = $3, primary_image = $4, other_images = $5, available_quantity = $6 WHERE id = $7 RETURNING *',
        [name, description, price, primary_image, other_images, available_quantity, id]
      );
      return result.rows[0];
    },
    deleteVehicle: async (_, { id }) => {
      await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
      return `Vehicle with ID ${id} deleted.`;
    },
  },
};

module.exports = vehicleResolvers;
