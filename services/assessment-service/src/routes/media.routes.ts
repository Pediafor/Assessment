import { Router } from 'express';
import { imageUpload, audioUpload, videoUpload, mediaUpload } from '../middleware/upload';
import { extractUserContext, requireTeacherOrAdmin } from '../middleware/userContext';
import { Request, Response } from 'express';

const router = Router();

// Apply user context extraction to all routes
router.use(extractUserContext);

/**
 * Upload question media (images, audio, video)
 * POST /media/question
 */
router.post('/question', requireTeacherOrAdmin, mediaUpload, async (req: Request, res: Response) => {
  try {
    const files = req.uploadedFiles || [];
    const fields = req.formFields || {};

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        timestamp: new Date().toISOString()
      });
    }

    // Here you would typically save file metadata to database
    // For now, just return the file information
    
    res.status(201).json({
      success: true,
      data: {
        files: files.map(file => ({
          id: file.id,
          originalName: file.originalName,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          dimensions: file.dimensions
        })),
        fields
      },
      message: 'Files uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Upload option media (images for multiple choice options)
 * POST /media/option
 */
router.post('/option', requireTeacherOrAdmin, imageUpload, async (req: Request, res: Response) => {
  try {
    const files = req.uploadedFiles || [];
    const fields = req.formFields || {};

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded',
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: {
        images: files.map(file => ({
          id: file.id,
          originalName: file.originalName,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          dimensions: file.dimensions
        })),
        fields
      },
      message: 'Images uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Upload audio files
 * POST /media/audio
 */
router.post('/audio', requireTeacherOrAdmin, audioUpload, async (req: Request, res: Response) => {
  try {
    const files = req.uploadedFiles || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No audio files uploaded',
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: {
        audioFiles: files.map(file => ({
          id: file.id,
          originalName: file.originalName,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: file.url,
          duration: file.duration
        }))
      },
      message: 'Audio files uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Upload video files
 * POST /media/video
 */
router.post('/video', requireTeacherOrAdmin, videoUpload, async (req: Request, res: Response) => {
  try {
    const files = req.uploadedFiles || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No video files uploaded',
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: {
        videoFiles: files.map(file => ({
          id: file.id,
          originalName: file.originalName,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: file.url,
          duration: file.duration,
          dimensions: file.dimensions
        }))
      },
      message: 'Video files uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;