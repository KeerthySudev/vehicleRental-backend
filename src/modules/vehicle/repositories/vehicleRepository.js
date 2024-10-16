
const minioClient = require('../../../configs/minio/minioConfig');


const uploadVehicleImage = async (fileStream, bucketName, objectName) => {
  try {
    const chunks = [];
    fileStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    return new Promise((resolve, reject) => {
      fileStream.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        await minioClient.putObject(bucketName, objectName, buffer);
        console.log('File uploaded successfully.');

        resolve(`${bucketName}/${objectName}`);
      });

      fileStream.on('error', (err) => {
        console.error('Error reading file stream:', err);
        reject(new Error(err));
      });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

module.exports = {
  uploadVehicleImage
};

