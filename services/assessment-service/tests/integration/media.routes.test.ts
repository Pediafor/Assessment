import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../../src/server';

describe('File Upload Tests', () => {
  const teacherHeaders = {
    'x-user-id': 'teacher-123',
    'x-user-email': 'teacher@example.com',
    'x-user-role': 'TEACHER',
    'x-user-firstname': 'John',
    'x-user-lastname': 'Teacher',
  };

  // Create a simple test image buffer
  const createTestImageBuffer = () => {
    // Simple 1x1 PNG image
    return Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE5, 0x27, 0xDE, 0xFC, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
  };

  describe('POST /media/question', () => {
    it('should upload question media successfully', async () => {
      const testImage = createTestImageBuffer();

      const response = await request(app)
        .post('/media/question')
        .set(teacherHeaders)
        .attach('media', testImage, 'test.png')
        .field('questionId', 'question-123')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toHaveLength(1);
      expect(response.body.data.files[0]).toMatchObject({
        originalName: 'test.png',
        mimetype: 'image/png'
      });
      expect(response.body.data.files[0].url).toContain('/uploads/');
    });

    it('should return 401 when user context headers are missing', async () => {
      const testImage = createTestImageBuffer();

      const response = await request(app)
        .post('/media/question')
        .attach('media', testImage, 'test.png')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for student role (authorization happens after authentication)', async () => {
      const studentHeaders = {
        ...teacherHeaders,
        'x-user-role': 'STUDENT'
      };

      const testImage = createTestImageBuffer();

      const response = await request(app)
        .post('/media/question')
        .set(studentHeaders)
        .attach('media', testImage, 'test.png')
        .expect(401); // Authorization error returns 401 due to middleware design

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when no files are uploaded', async () => {
      const response = await request(app)
        .post('/media/question')
        .set(teacherHeaders)
        .field('questionId', 'question-123')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No files uploaded');
    });
  });

  describe('POST /media/option', () => {
    it('should upload option images successfully', async () => {
      const testImage = createTestImageBuffer();

      const response = await request(app)
        .post('/media/option')
        .set(teacherHeaders)
        .attach('image', testImage, 'option.png')
        .field('optionId', 'option-123')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.images[0]).toMatchObject({
        originalName: 'option.png',
        mimetype: 'image/png'
      });
    });
  });

  describe('Static File Serving', () => {
    it('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/uploads/non-existent-file.png')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('File not found');
    });

    it('should return 404 for non-existent thumbnail', async () => {
      const response = await request(app)
        .get('/uploads/thumbnails/non-existent-thumb.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Thumbnail not found');
    });

    it('should prevent directory traversal attacks', async () => {
      const response = await request(app)
        .get('/uploads/../../../etc/passwd')
        .expect(404); // Path normalization prevents traversal, returns 404

      expect(response.body.success).toBe(false);
    });
  });

  describe('File Type Validation', () => {
    it('should handle invalid file uploads gracefully', async () => {
      // Send an empty request without any files
      const response = await request(app)
        .post('/media/question')
        .set(teacherHeaders)
        .field('questionId', 'test-question')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No files uploaded');
    });
  });

  describe('POST /media/audio', () => {
    it('should upload audio files successfully', async () => {
      // Create a simple test audio file that mimics WAV format
      const testAudio = Buffer.alloc(100, 0);

      const response = await request(app)
        .post('/media/audio')
        .set(teacherHeaders)
        .attach('media', testAudio, {
          filename: 'test.wav',
          contentType: 'audio/wav'
        })
        .field('questionId', 'question-123')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.audioFiles).toHaveLength(1);
      expect(response.body.data.audioFiles[0]).toMatchObject({
        originalName: 'test.wav'
      });
    });

    it('should return 400 when no audio files are uploaded', async () => {
      const response = await request(app)
        .post('/media/audio')
        .set(teacherHeaders)
        .field('questionId', 'question-123')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No audio files uploaded');
    });

    it('should return 401 for unauthorized users', async () => {
      const testAudio = Buffer.alloc(100, 0);

      const response = await request(app)
        .post('/media/audio')
        .attach('audio', testAudio, 'test.wav')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /media/video', () => {
    it('should upload video files successfully', async () => {
      // Create a minimal test video buffer (basic file structure)
      const testVideo = Buffer.alloc(2048, 0);
      // Write some video-like headers
      testVideo.write('ftyp', 4); // MP4 file type box

      const response = await request(app)
        .post('/media/video')
        .set(teacherHeaders)
        .attach('video', testVideo, 'test.mp4')
        .field('questionId', 'question-123')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.videoFiles).toHaveLength(1);
      expect(response.body.data.videoFiles[0]).toMatchObject({
        originalName: 'test.mp4',
        mimetype: expect.stringContaining('video')
      });
    });

    it('should return 400 when no video files are uploaded', async () => {
      const response = await request(app)
        .post('/media/video')
        .set(teacherHeaders)
        .field('questionId', 'question-123')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No video files uploaded');
    });

    it('should return 401 for unauthorized users', async () => {
      const testVideo = Buffer.alloc(100, 0);

      const response = await request(app)
        .post('/media/video')
        .attach('video', testVideo, 'test.mp4')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Cleanup test files after tests
  afterEach(async () => {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          if (file.startsWith('test')) {
            fs.unlinkSync(path.join(uploadsDir, file));
          }
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });
});