import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jaipur_shop',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
  } as any,
});

const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5') * 1024 * 1024;

export const upload = multer({
  storage,
  limits: { fileSize: maxSize },
});
