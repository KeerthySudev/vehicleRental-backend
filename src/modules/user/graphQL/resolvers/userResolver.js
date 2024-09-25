
const customerValidationSchema = require('../../requests/userRequests');
const userService = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';


// Define resolvers for your schema
const userResolvers = {
  Query: {
    hello: () => 'Hello, Vehicle Rental Management!',
    users: async () => {
        return await userService.getAllUsers();
      
    },
    customers: async () => {
      return await userService.getAllCustomers();
    
  },
  customer: async (_, { email }) => {
    return await userService.getCustomer(email);
    
  },
  },
    Mutation: {
      addUser: async (_, { name }) => {
        return await userService.addUser(name);
        
      },
      updateUser: async (_, { id, name }) => {
        return await userService.updateUser(id, name);
        
      },
      deleteUser: async (_, { id }) => {
        return await userService.deleteUser(id);
        
      },
      registerCustomer: async (_, { customerInput }) => {
        // Validate input with Joi
        const { error } = customerValidationSchema.validate(customerInput);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }
        const hashedPassword = await bcrypt.hash(customerInput.password, 10);
        return await userService.registerCustomer(customerInput,hashedPassword);
      },
      login: async (_, { email, password }) => {
        const user = await userService.getCustomer(email);
  
        if (!user) {
          throw new Error('User not found');
        }
  
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error('Invalid password');
        }
  
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
  
        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            city: user.city,
            state: user.state,
            country: user.country,
            pincode: user.pincode,
          },
        };
      },
    },
};

module.exports = userResolvers;



