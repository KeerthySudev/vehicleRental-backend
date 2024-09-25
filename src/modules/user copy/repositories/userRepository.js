const pool = require("../../../configs/dbConfig");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const getAllCustomers = async () => {
  const result = await pool.query("SELECT * FROM customers");
  return result.rows;
};

const getCustomer = async (email) => {
  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    return result.rows[0];
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
      hashedPassword,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getAllCustomers,
  getCustomer,
  addUser,
  updateUser,
  deleteUser,
  registerCustomer,
};
