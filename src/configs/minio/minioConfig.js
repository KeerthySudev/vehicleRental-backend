// configs/minioConfig.js
const Minio = require('minio');

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const minioPath = process.env.MINIO_PATH;
const bucket = process.env.MINIO_BUCKET;

module.exports = {minioClient, minioPath, bucket};
