import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import { 
  CreateSubmissionRequest, 
  UpdateSubmissionRequest, 
  SubmissionQuery,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  UserContext 
} from '../types';
import { getSubmissionEventPublisher } from '../events/publisher';

export class SubmissionService {
  
  // Create a new submission
  async createSubmission(data: CreateSubmissionRequest, user: UserContext) {
    // Validate input
    if (!data.assessmentId || data.assessmentId.trim() === '') {
      throw new ValidationError('Assessment ID is required');
    }

    // Check if submission already exists for this student and assessment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assessmentId: data.assessmentId,
        userId: user.id
      }
    });

    if (existingSubmission) {
      throw new ValidationError('Submission already exists for this assessment');
    }

    const submission = await prisma.submission.create({
      data: {
        assessmentId: data.assessmentId,
        userId: user.id,
        answers: Prisma.JsonNull,
        status: 'DRAFT',
        ipAddress: '', // Would be extracted from request in real implementation
        userAgent: '', // Would be extracted from request in real implementation
      },
      include: {
        files: true,
        grades: true
      }
    });

    return submission;
  }

  // Get submission by ID
  async getSubmissionById(submissionId: string, user: UserContext) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        files: true,
        grades: true,
        attempts: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    // Students can only access their own submissions
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      throw new UnauthorizedError('Access denied');
    }

    return submission;
  }

  // Get submission by assessment and student
  async getSubmissionByAssessment(assessmentId: string, studentId?: string, user?: UserContext) {
    // If no studentId provided and user is a student, use their ID
    const targetStudentId = studentId || (user?.role === 'STUDENT' ? user.id : null);
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required');
    }

    // Students can only access their own submissions
    if (user?.role === 'STUDENT' && targetStudentId !== user.id) {
      throw new NotFoundError('Submission not found');
    }

    const submission = await prisma.submission.findFirst({
      where: {
        assessmentId,
        userId: targetStudentId
      },
      include: {
        files: true,
        grades: true,
        attempts: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return submission;
  }

  // Update submission
  async updateSubmission(submissionId: string, data: UpdateSubmissionRequest, user: UserContext) {
    const submission = await this.getSubmissionById(submissionId, user);
    const previousStatus = submission.status;

    // Only the student who owns the submission can update it (unless admin/teacher)
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      throw new UnauthorizedError('Access denied');
    }

    // Students can only update their own draft submissions and limited fields
    if (user.role === 'STUDENT') {
      if (submission.status !== 'DRAFT') {
        throw new ValidationError('Students can only update their own draft submissions');
      }
      // Students can only update answers or submit (change status to SUBMITTED), not scores
      if (data.score !== undefined || data.maxScore !== undefined || 
          (data.status && data.status !== 'SUBMITTED')) {
        throw new ValidationError('Students can only update their own draft submissions');
      }
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        ...data,
        ...(data.status === 'SUBMITTED' && !submission.submittedAt && {
          submittedAt: new Date()
        })
      },
      include: {
        files: true,
        grades: true
      }
    });

    // Publish events when status changes
    try {
      const eventPublisher = getSubmissionEventPublisher();
      await eventPublisher.ensureConnection();

      if (data.status && data.status !== previousStatus) {
        const eventData = {
          submissionId: updatedSubmission.id,
          assessmentId: updatedSubmission.assessmentId,
          studentId: updatedSubmission.userId,
          status: updatedSubmission.status as any,
          totalMarks: updatedSubmission.maxScore || undefined,
          submittedAt: updatedSubmission.submittedAt?.toISOString(),
          answers: Array.isArray(updatedSubmission.answers) ? updatedSubmission.answers : []
        };

        const metadata = {
          userId: user.id,
          correlationId: `submission-update-${updatedSubmission.id}-${Date.now()}`
        };

        if (data.status === 'SUBMITTED') {
          await eventPublisher.publishSubmissionSubmitted(eventData, metadata);
          console.log(`🎯 Published submission.submitted event for submission ${submissionId}`);
        } else {
          await eventPublisher.publishSubmissionUpdated({
            ...eventData,
            previousStatus,
            updatedFields: Object.keys(data)
          }, metadata);
          console.log(`🔄 Published submission.updated event for submission ${submissionId}`);
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to publish submission event:', error);
      // Don't fail the update if event publishing fails
    }

    return updatedSubmission;
  }

  // Submit submission (mark as completed)
  async submitSubmission(submissionId: string, user: UserContext) {
    const submission = await this.getSubmissionById(submissionId, user);

    // Only students can submit their own submissions
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      throw new UnauthorizedError('Access denied');
    }

    // Check if already submitted
    if (submission.status !== 'DRAFT') {
      throw new ValidationError('Submission has already been submitted');
    }

    return this.updateSubmission(submissionId, { 
      status: 'SUBMITTED',
      submittedAt: new Date()
    }, user);
  }

  // Save/update answers in submission
  async saveAnswers(submissionId: string, answers: any, user: UserContext) {
    const submission = await this.getSubmissionById(submissionId, user);

    // Only the student who owns the submission can save answers
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      throw new NotFoundError('Submission not found');
    }

    // Check if submission is still in progress
    if (submission.status !== 'DRAFT') {
      throw new ValidationError('Cannot modify a submitted submission');
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        answers: answers,
        updatedAt: new Date()
      }
    });

    return updatedSubmission;
  }

  // Get all submissions with filtering
  async getSubmissions(query: SubmissionQuery, user: UserContext) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100); // Max 100 items
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SubmissionWhereInput = {};

    if (query.assessmentId) {
      where.assessmentId = query.assessmentId;
    }

    if (query.studentId) {
      where.userId = query.studentId;
    }

    if (query.status) {
      where.status = query.status as any;
    }

    // Students can only see their own submissions
    if (user.role === 'STUDENT') {
      where.userId = user.id;
    }

    // Build order clause
    const orderBy: Prisma.SubmissionOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.SubmissionOrderByWithRelationInput] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          files: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              fileSize: true,
              questionId: true
            }
          },
          grades: {
            select: {
              id: true,
              questionId: true,
              score: true,
              maxScore: true,
              gradingType: true
            }
          }
        }
      }),
      prisma.submission.count({ where })
    ]);

    return {
      submissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Delete submission (admin only)
  async deleteSubmission(submissionId: string, user: UserContext) {
    if (user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required');
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    await prisma.submission.delete({
      where: { id: submissionId }
    });

    return { success: true, message: 'Submission deleted successfully' };
  }

  // Get submission statistics
  async getSubmissionStats(assessmentId: string, user: UserContext) {
    if (user.role === 'STUDENT') {
      throw new UnauthorizedError('Access denied');
    }

    const stats = await prisma.submission.groupBy({
      by: ['status'],
      where: { assessmentId },
      _count: { status: true }
    });

    const totalSubmissions = await prisma.submission.count({
      where: { assessmentId }
    });

    return {
      assessmentId,
      totalSubmissions,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}