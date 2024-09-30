import express from 'express';
import path from 'path';
import fs from 'fs/promises';

/**
 * Static file serving middleware for uploaded files
 */
export function createStaticFileServer() {
  const router = express.Router();
  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Serve uploaded files
  router.get('/:filename', async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadsDir, filename);
      
      // Security check: prevent directory traversal
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          error: 'File not found',
          timestamp: new Date().toISOString()
        });
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Serve thumbnails
  router.get('/thumbnails/:filename', async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadsDir, 'thumbnails', filename);
      
      // Security check: prevent directory traversal
      if (!filePath.startsWith(path.join(uploadsDir, 'thumbnails'))) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          error: 'Thumbnail not found',
          timestamp: new Date().toISOString()
        });
      }

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving thumbnail:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
}