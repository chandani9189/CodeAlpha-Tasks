import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

const storage = multer.memoryStorage();

// Allow multiple files
export const upload = multer({ storage });

// Upload single file to ImageKit
export const uploadToImageKit = async (fileBuffer, fileName) => {
  const formData = new FormData();
  formData.append('file', fileBuffer.toString('base64'));
  formData.append('fileName', `${Date.now()}-${fileName}`);
  formData.append('folder', '/shopease-products');

  const response = await axios.post(
    'https://upload.imagekit.io/api/v1/files/upload',
    formData,
    {
      headers: { ...formData.getHeaders() },
      auth: {
        username: process.env.IMAGEKIT_PRIVATE_KEY,
        password: '',
      },
    }
  );
  return response.data.url;
};