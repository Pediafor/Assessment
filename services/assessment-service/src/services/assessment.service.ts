import { prisma } from '../prismaClient';
import {
  Assessment,
  AssessmentWithSets,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  PaginatedResponse,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  UserContext
} from '../types';

export class AssessmentService {
  /**
   * Create a new assessment
   */
  async createAssessment(data: CreateAssessmentRequest, user: UserContext): Promise<Assessment> {
    try {
      const assessment = await prisma.assessment.create({
        data: {
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          createdBy: user.id,
          settings: data.settings as any || {},
          deadline: data.deadline,
        },
      });

      return assessment;
    } catch (error) {
      throw new Error(`Failed to create assessment: ${error}`);
    }
  }

  /**
   * Get assessment by ID with ownership validation
   */
  async getAssessmentById(id: string, user: UserContext): Promise<AssessmentWithSets> {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        isActive: true,
        ...(user.role !== 'ADMIN' && { createdBy: user.id }),
      },
      include: {
        questionSets: {
          where: { isActive: true },
          include: {
            questions: {
              where: { isActive: true },
              include: {
                mediaItems: true,
                options: {
                  include: {
                    mediaItems: true,
                  },
                },
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    return assessment as AssessmentWithSets;
  }

  /**
   * Get assessment by ID without ownership filtering (for permission checks and events)
   */
  async getAssessmentByIdInternal(id: string): Promise<AssessmentWithSets | null> {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        questionSets: {
          where: { isActive: true },
          include: {
            questions: {
              where: { isActive: true },
              include: {
                mediaItems: true,
                options: {
                  include: {
                    mediaItems: true,
                  },
                },
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return assessment as AssessmentWithSets | null;
  }

  /**
   * Get all assessments for a user (paginated)
   */
  async getAssessments(
    user: UserContext,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaginatedResponse<Assessment>> {
    const skip = (page - 1) * limit;
    
    const where: any = {
      isActive: true,
    };

    // Role-based visibility
    if (user.role === 'STUDENT') {
      // Students can only see published assessments (created by any teacher)
      where.status = 'PUBLISHED';
    } else {
      // Teachers see only their own by default; Admins see all
      if (user.role !== 'ADMIN') {
        where.createdBy = user.id;
      }
      if (status) {
        where.status = status as any;
      }
    }

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.assessment.count({ where }),
    ]);

    return {
      items: assessments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update assessment
   */
  async updateAssessment(
    id: string,
    data: UpdateAssessmentRequest,
    user: UserContext
  ): Promise<Assessment> {
    // Get assessment without ownership filtering to check permissions
    const existingAssessment = await this.getAssessmentByIdInternal(id);
    
    if (!existingAssessment) {
      throw new NotFoundError('Assessment not found');
    }
    
    if (existingAssessment.createdBy !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only update your own assessments');
    }

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.settings && { settings: data.settings as any }),
        ...(data.status && { status: data.status as any }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
        updatedAt: new Date(),
      },
    });

    return assessment;
  }

  /**
   * Delete assessment (soft delete)
   */
  async deleteAssessment(id: string, user: UserContext): Promise<void> {
    // Get assessment without ownership filtering to check permissions
    const existingAssessment = await this.getAssessmentByIdInternal(id);
    
    if (!existingAssessment) {
      throw new NotFoundError('Assessment not found');
    }
    
    if (existingAssessment.createdBy !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only update your own assessments');
    }

    await prisma.assessment.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Publish assessment
   */
  async publishAssessment(id: string, user: UserContext): Promise<Assessment> {
    const assessment = await this.getAssessmentByIdInternal(id);
    
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }
    
    if (assessment.createdBy !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only publish your own assessments');
    }

    // Check if assessment is already published
    if (assessment.status === 'PUBLISHED') {
      throw new ValidationError('Assessment is already published');
    }

    // Validate assessment has questions
    if (!assessment.questionSets.length) {
      throw new Error('Cannot publish assessment without question sets');
    }

    const hasQuestions = assessment.questionSets.some(set => set.questions.length > 0);
    if (!hasQuestions) {
      throw new Error('Cannot publish assessment without questions');
    }

    return await prisma.assessment.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  /**
   * Duplicate assessment
   */
  async duplicateAssessment(id: string, user: UserContext): Promise<Assessment> {
    const originalAssessment = await this.getAssessmentById(id, user);

    const newAssessment = await prisma.assessment.create({
      data: {
        title: `${originalAssessment.title} (Copy)`,
        description: originalAssessment.description,
        instructions: originalAssessment.instructions,
        createdBy: user.id,
        settings: originalAssessment.settings,
        status: 'DRAFT',
      },
    });

    // TODO: Copy question sets and questions in Phase 2
    
    return newAssessment;
  }

  /**
   * Update assessment statistics
   */
  async updateAssessmentStats(assessmentId: string, stats: {
    totalSubmissions?: number;
    completedSubmissions?: number;
    averageScore?: number;
    lastSubmissionAt?: Date;
  }): Promise<void> {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        settings: {
          ...(await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { settings: true } }))?.settings as any || {},
          stats: {
            ...((await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { settings: true } }))?.settings as any)?.stats || {},
            ...stats,
            updatedAt: new Date().toISOString(),
          }
        },
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Calculate assessment analytics
   */
  async calculateAssessmentAnalytics(assessmentId: string): Promise<any> {
    // This would typically involve complex calculations
    // For now, return a simple structure
    return {
      submissionsCount: 0,
      averageScore: 0,
      completionRate: 0,
      averageTimeSpent: 0,
      difficultyDistribution: {
        easy: 0,
        medium: 0,
        hard: 0,
      },
      submissionsByDay: [],
      topPerformers: [],
      commonMistakes: [],
    };
  }

  /**
   * Mark submission grading as complete for an assessment
   */
  async markSubmissionGradingComplete(
    assessmentId: string, 
    submissionId: string, 
    gradeData: {
      score?: number;
      feedback?: string;
      gradedAt?: Date;
    }
  ): Promise<void> {
    // Update assessment statistics
    await this.updateAssessmentStats(assessmentId, {
      completedSubmissions: 1, // This would be incremented
      lastSubmissionAt: new Date(),
    });

    // Log the grading completion
    console.log(`✅ Submission ${submissionId} grading completed for assessment ${assessmentId}`);
  }

  /**
   * Check if all submissions for an assessment are graded
   */
  async checkAllSubmissionsGraded(assessmentId: string): Promise<boolean> {
    // This would typically check the submission service
    // For now, return false as a placeholder
    return false;
  }

  /**
   * Update organization statistics
   */
  async updateOrganizationStats(organizationId: string, stats: {
    totalUsers?: number;
    activeUsers?: number;
    totalAssessments?: number;
    lastActivityAt?: Date;
  }): Promise<void> {
    // This would typically update organization-level statistics
    // For now, just log the update
    console.log(`📊 Updated organization ${organizationId} stats:`, stats);
  }
}