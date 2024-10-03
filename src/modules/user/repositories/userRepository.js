const pool = require("../../../configs/dbConfig");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllCustomers = async () => {
  const result = await pool.query("SELECT * FROM customers");
  return result.rows;
};

const getCustomer = async (email) => {
  const customer = await prisma.customer.findUnique({
    where: {
      email: email,
    },
  })
  
  return customer
};

const addUser = async (name) => {
  const result = await pool.query(
    'INSERT INTO users (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

const updateUser = async (id, name) => {
  const result = await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return `User with ID ${id} deleted.`;
};

const registerCustomer = async (customerInput,hashedPassword) => {
  const customer = await prisma.customer.create({
    data: {
      name: customerInput.name,
      email: customerInput.email,
      phone: customerInput.phone,
      city: customerInput.city,
      state: customerInput.state,
      country: customerInput.country,
      pincode: customerInput.pincode,
      password: hashedPassword,
      role: "user",
    },
  })

  return customer
};

module.exports = {
  getAllCustomers,
  getCustomer,
  addUser,
  updateUser,
  deleteUser,
  registerCustomer,
};
