
const pool = require('../../../configs/dbConfig');
const minioClient = require('../../../configs/minioConfig');

const getAllVehicles = async () => {
  const result = await pool.query('SELECT * FROM vehicles');
  return result.rows;
};

const getVehicleById = async (id) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return result.rows[0];
};

const addVehicle = async (name, description, price,  available_quantity) => {
  const result = await pool.query(
    'INSERT INTO vehicles (name, description, price, available_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, price, available_quantity]
  );
  return result.rows[0];
};

const updateVehicle = async (id, name, description, price, primary_image, other_images, available_quantity) => {
  const result = await pool.query(
    'UPDATE vehicles SET name = $1, description = $2, price = $3, primary_image = $4, other_images = $5, available_quantity = $6 WHERE id = $7 RETURNING *',
    [name, description, price, primary_image, other_images, available_quantity, id]
  );
  return result.rows[0];
};

const deleteVehicle = async (id) => {
  await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  return `Vehicle with ID ${id} deleted.`;
};



module.exports = {
  getAllVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};

