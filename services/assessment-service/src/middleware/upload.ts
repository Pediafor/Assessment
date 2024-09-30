import { Request, Response, NextFunction } from 'express';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types and sizes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface ProcessedFile extends UploadedFile {
  thumbnailPath?: string;
  thumbnailUrl?: string;
  duration?: number; // For audio/video files
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * File upload middleware using formidable
 */
export const uploadMiddleware = (options: {
  maxFiles?: number;
  allowedTypes?: string[];
  maxFileSize?: number;
} = {}) => {
  const {
    maxFiles = 5,
    allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES],
    maxFileSize = MAX_FILE_SIZE
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      await ensureDirectoryExists(uploadDir);

      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFiles,
        maxFileSize,
        maxTotalFileSize: maxFileSize * maxFiles,
        filter: ({ mimetype }) => {
          return allowedTypes.includes(mimetype || '');
        },
        filename: (name, ext, part) => {
          const uniqueId = uuidv4();
          const timestamp = Date.now();
          return `${timestamp}-${uniqueId}${ext}`;
        }
      });

      const [fields, files] = await form.parse(req);
      
      // Process uploaded files
      const processedFiles: ProcessedFile[] = [];
      
      for (const [fieldName, fileArray] of Object.entries(files)) {
        if (Array.isArray(fileArray)) {
          for (const file of fileArray) {
            const processedFile = await processFile(file, uploadDir);
            processedFiles.push(processedFile);
          }
        }
      }

      // Add processed files and fields to request
      req.uploadedFiles = processedFiles;
      req.formFields = fields as { [key: string]: string | string[] };

      next();
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(400).json({
        success: false,
        error: 'File upload failed',
        message: error instanceof Error ? error.message : 'Unknown upload error',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Process uploaded file (create thumbnails, extract metadata)
 */
async function processFile(file: formidable.File, uploadDir: string): Promise<ProcessedFile> {
  const fileId = uuidv4();
  const relativePath = path.relative(process.cwd(), file.filepath);
  const baseUrl = process.env.BASE_URL || 'http://localhost:4001';
  
  const processedFile: ProcessedFile = {
    id: fileId,
    originalName: file.originalFilename || 'unknown',
    filename: path.basename(file.filepath),
    path: relativePath,
    mimetype: file.mimetype || 'application/octet-stream',
    size: file.size,
    url: `${baseUrl}/uploads/${path.basename(file.filepath)}`
  };

  // Process images
  if (ALLOWED_IMAGE_TYPES.includes(processedFile.mimetype)) {
    try {
      const imageInfo = await sharp(file.filepath).metadata();
      
      if (imageInfo.width && imageInfo.height) {
        processedFile.dimensions = {
          width: imageInfo.width,
          height: imageInfo.height
        };
      }

      // Create thumbnail for images
      const thumbnailName = `thumb-${path.basename(file.filepath)}`;
      const thumbnailPath = path.join(uploadDir, 'thumbnails', thumbnailName);
      
      await ensureDirectoryExists(path.dirname(thumbnailPath));
      
      await sharp(file.filepath)
        .resize(300, 300, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      processedFile.thumbnailPath = path.relative(process.cwd(), thumbnailPath);
      processedFile.thumbnailUrl = `${baseUrl}/uploads/thumbnails/${thumbnailName}`;
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }

  return processedFile;
}

/**
 * Middleware to validate file types for specific endpoints
 */
export const validateFileTypes = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.uploadedFiles || [];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type',
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    next();
  };
};

/**
 * Middleware for image uploads only
 */
export const imageUpload = uploadMiddleware({
  maxFiles: 10,
  allowedTypes: ALLOWED_IMAGE_TYPES,
  maxFileSize: MAX_IMAGE_SIZE
});

/**
 * Middleware for audio uploads only
 */
export const audioUpload = uploadMiddleware({
  maxFiles: 5,
  allowedTypes: ALLOWED_AUDIO_TYPES,
  maxFileSize: MAX_AUDIO_SIZE
});

/**
 * Middleware for video uploads only  
 */
export const videoUpload = uploadMiddleware({
  maxFiles: 3,
  allowedTypes: ALLOWED_VIDEO_TYPES,
  maxFileSize: MAX_VIDEO_SIZE
});

/**
 * Middleware for mixed media uploads
 */
export const mediaUpload = uploadMiddleware({
  maxFiles: 10,
  allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_VIDEO_TYPES],
  maxFileSize: MAX_FILE_SIZE
});

/**
 * Utility function to ensure directory exists
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Cleanup uploaded files (for error scenarios)
 */
export async function cleanupFiles(files: ProcessedFile[]): Promise<void> {
  for (const file of files) {
    try {
      await fs.unlink(file.path);
      if (file.thumbnailPath) {
        await fs.unlink(file.thumbnailPath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', file.path, error);
    }
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      uploadedFiles?: ProcessedFile[];
      formFields?: { [key: string]: string | string[] };
    }
  }
}