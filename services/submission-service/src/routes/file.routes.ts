import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FileService } from '../services/file.service';
import { extractUserContext, requireStudent } from '../middleware/userContext';
import { ApiResponse, ValidationError } from '../types';

const router = Router();
const fileService = new FileService();

// Apply user context extraction to all routes
router.use(extractUserContext);

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ValidationError(errors.array()[0].msg);
    return next(error);
  }
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'submissions');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.match(/^(image|application|text|video)\//);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, text files, and videos are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter
});

// Multer error handler middleware
const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ValidationError('File size exceeds the 10MB limit'));
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new ValidationError('Too many files. Only one file per upload is allowed'));
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ValidationError('Unexpected file field'));
    }
  }
  next(error);
};

/**
 * @route   POST /api/submissions/:submissionId/files
 * @desc    Upload a file to a submission
 * @access  Students (own submissions), Teachers, Admins
 */
router.post(
  '/submissions/:submissionId/files',
  requireStudent,
  [
    param('submissionId')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    validateRequest
  ],
  upload.single('file'),
  handleMulterError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      const fileData = {
        submissionId: req.params.submissionId,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        questionId: req.body.questionId,
        description: req.body.description
      };

      const submissionFile = await fileService.createSubmissionFile(fileData, req.user);

      const response: ApiResponse = {
        success: true,
        data: submissionFile,
        message: 'File uploaded successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

/**
 * @route   GET /api/submissions/:submissionId/files
 * @desc    Get all files for a submission
 * @access  Students (own submissions), Teachers, Admins
 */
router.get(
  '/submissions/:submissionId/files',
  [
    param('submissionId')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = await fileService.getSubmissionFiles(req.params.submissionId, req.user);

      const response: ApiResponse = {
        success: true,
        data: files
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/submissions/:submissionId/files/stats
 * @desc    Get file statistics for a submission
 * @access  Students (own submissions), Teachers, Admins
 */
router.get(
  '/submissions/:submissionId/files/stats',
  [
    param('submissionId')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await fileService.getFileStats(req.params.submissionId, req.user);

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/files/:fileId
 * @desc    Get file details
 * @access  Students (own files), Teachers, Admins
 */
router.get(
  '/files/:fileId',
  [
    param('fileId')
      .notEmpty()
      .withMessage('File ID is required')
      .isString()
      .withMessage('File ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await fileService.getFileById(req.params.fileId, req.user);

      const response: ApiResponse = {
        success: true,
        data: file
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/files/:fileId/download
 * @desc    Download a file
 * @access  Students (own files), Teachers, Admins
 */
router.get(
  '/files/:fileId/download',
  [
    param('fileId')
      .notEmpty()
      .withMessage('File ID is required')
      .isString()
      .withMessage('File ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileInfo = await fileService.downloadFile(req.params.fileId, req.user);

      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.originalName}"`);
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Length', fileInfo.fileSize);

      res.sendFile(path.resolve(fileInfo.filePath));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/files/:fileId
 * @desc    Delete a file
 * @access  Students (own files from draft submissions), Teachers, Admins
 */
router.delete(
  '/files/:fileId',
  [
    param('fileId')
      .notEmpty()
      .withMessage('File ID is required')
      .isString()
      .withMessage('File ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fileService.deleteFile(req.params.fileId, req.user);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: result.message
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;