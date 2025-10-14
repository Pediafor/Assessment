import { UserContext, ValidationError, NotFoundError, UnauthorizedError } from '../types';
import prisma from '../prismaClient';
import fs from 'fs';
import path from 'path';


export interface CreateFileRequest {
  submissionId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  questionId?: string;
  description?: string;
}

export class FileService {
  /**
   * Create a new file for a submission
   */
  async createSubmissionFile(fileData: CreateFileRequest, user: UserContext) {
    // Verify submission exists and user has access
    const submission = await prisma.submission.findUnique({
      where: { id: fileData.submissionId }
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    // Students can only add files to their own submissions
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      throw new UnauthorizedError('Access denied');
    }

    // Check if submission is in draft status (only allow file uploads for drafts)
    if (submission.status !== 'DRAFT') {
      throw new ValidationError('Files can only be uploaded to draft submissions');
    }

    const submissionFile = await prisma.submissionFile.create({
      data: {
        submissionId: fileData.submissionId,
        originalName: fileData.originalName,
        fileName: fileData.fileName,
        filePath: fileData.filePath,
        mimeType: fileData.mimeType,
        fileSize: fileData.fileSize,
        questionId: fileData.questionId,
        description: fileData.description,
      }
    });

    // Log the file upload attempt
    await prisma.attemptLog.create({
      data: {
        submissionId: fileData.submissionId,
        action: 'FILE_ADDED',
        data: {
          fileName: fileData.fileName,
          originalName: fileData.originalName,
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType
        }
      }
    });

    return submissionFile;
  }

  /**
   * Get files for a submission
   */
  async getSubmissionFiles(submissionId: string, user: UserContext) {
    // Verify submission exists and user has access
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        files: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    // Students can only access their own submission files
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      throw new UnauthorizedError('Access denied');
    }

    return submission.files;
  }

  /**
   * Get a specific file
   */
  async getFileById(fileId: string, user: UserContext) {
    const file = await prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: true
      }
    });

    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Students can only access their own submission files
    if (user.role === 'STUDENT' && file.submission.userId !== user.id) {
      throw new UnauthorizedError('Access denied');
    }

    return file;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, user: UserContext) {
    const file = await prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: true
      }
    });

    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Students can only delete their own files, and only from draft submissions
    if (user.role === 'STUDENT') {
      if (file.submission.userId !== user.id) {
        throw new UnauthorizedError('Access denied');
      }
      if (file.submission.status !== 'DRAFT') {
        throw new ValidationError('Files can only be deleted from draft submissions');
      }
    }

    // Delete physical file
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
      // Continue with database deletion even if physical file deletion fails
    }

    // Delete from database
    await prisma.submissionFile.delete({
      where: { id: fileId }
    });

    // Log the file deletion
    await prisma.attemptLog.create({
      data: {
        submissionId: file.submissionId,
        action: 'FILE_REMOVED',
        data: {
          fileName: file.fileName,
          originalName: file.originalName,
          fileSize: file.fileSize
        }
      }
    });

    return {
      success: true,
      message: 'File deleted successfully'
    };
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string, user: UserContext) {
    const file = await this.getFileById(fileId, user);

    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundError('Physical file not found');
    }

    return {
      filePath: file.filePath,
      originalName: file.originalName,
      mimeType: file.mimeType,
      fileSize: file.fileSize
    };
  }

  /**
   * Get file statistics for a submission
   */
  async getFileStats(submissionId: string, user: UserContext) {
    const files = await this.getSubmissionFiles(submissionId, user);

  const totalSize = files.reduce((sum: number, file: { fileSize: number }) => sum + file.fileSize, 0);
  const fileTypes = files.reduce((types: Record<string, number>, file: { originalName: string }) => {
      const ext = path.extname(file.originalName).toLowerCase();
      types[ext] = (types[ext] || 0) + 1;
      return types;
    }, {} as Record<string, number>);

    return {
      totalFiles: files.length,
      totalSize,
      fileTypes,
  files: files.map((file: { id: string; originalName: string; fileSize: number; mimeType: string; createdAt: Date }) => ({
        id: file.id,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        createdAt: file.createdAt
      }))
    };
  }
}