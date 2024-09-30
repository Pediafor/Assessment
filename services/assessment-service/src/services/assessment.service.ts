import { prisma } from '../prismaClient';
import {
  Assessment,
  AssessmentWithSets,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  PaginatedResponse,
  NotFoundError,
  ForbiddenError,
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
      ...(user.role !== 'ADMIN' && { createdBy: user.id }),
      ...(status && { status: status as any }),
    };

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
    // Check ownership
    const existingAssessment = await this.getAssessmentById(id, user);
    
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
        updatedAt: new Date(),
      },
    });

    return assessment;
  }

  /**
   * Delete assessment (soft delete)
   */
  async deleteAssessment(id: string, user: UserContext): Promise<void> {
    // Check ownership
    await this.getAssessmentById(id, user);

    await prisma.assessment.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Publish assessment
   */
  async publishAssessment(id: string, user: UserContext): Promise<Assessment> {
    const assessment = await this.getAssessmentById(id, user);
    
    if (assessment.createdBy !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only publish your own assessments');
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
}