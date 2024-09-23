const pool = require("../../../configs/dbConfig");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const addUserDB = async (name) => {
  const result = await pool.query(
    "INSERT INTO users (name) VALUES ($1) RETURNING *",
    [name]
  );
  return result.rows[0];
};

const updateUser = async (id, name) => {
  const result = await pool.query(
    "UPDATE users SET name = $1 WHERE id = $2 RETURNING *",
    [name, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return `User with ID ${id} deleted.`;
};

module.exports = {
  getAllUsers,
  addUserDB,
  updateUser,
  deleteUser,
};
