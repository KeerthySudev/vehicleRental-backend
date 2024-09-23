const pool = require('../../../configs/dbConfig');
const customerValidationSchema = require('../requests/userRequests');
const userService = require('../controllers/userController');

// Define resolvers for your schema
const userResolvers = {
  Query: {
    hello: () => 'Hello, Vehicle Rental Management!',
    users: async () => {
      const result = await pool.query('SELECT * FROM users'); 
      return result.rows;
    },
  },
    Mutation: {
      addUser: async (_, { name }) => {
        const result = await pool.query(
          'INSERT INTO users (name) VALUES ($1) RETURNING *',
          [name]
        );
        return result.rows[0];
      },
      updateUser: async (_, { id, name }) => {
        const result = await pool.query(
          'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
          [name, id]
        );
        return result.rows[0];
      },
      deleteUser: async (_, { id }) => {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return `User with ID ${id} deleted.`;
      },
      registerCustomer: async (_, { customerInput }) => {
        // Validate input with Joi
        const { error } = customerValidationSchema.validate(customerInput);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }
  
        // Proceed with database operations after validation
        const result = await pool.query(
          'INSERT INTO customers (name, email, phone, city, state, country, pincode, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [
            customerInput.name,
            customerInput.email,
            customerInput.phone,
            customerInput.city,
            customerInput.state,
            customerInput.country,
            customerInput.pincode,
            customerInput.password, 
          ]
        );
  
        return result.rows[0];
      },
    },
};

module.exports = userResolvers;
