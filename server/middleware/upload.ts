import multer from 'multer';
import path from 'path';
import fs from 'fs';

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const uploadsDirectory = path.join(dataDirectory, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow images and videos
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  }
});

// Helper function to get file URL
export const getFileUrl = (filename: string) => {
  return `/uploads/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename: string) => {
  if (filename) {
    const filePath = path.join(uploadsDirectory, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
