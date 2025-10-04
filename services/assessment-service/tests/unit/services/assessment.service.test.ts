import { AssessmentService } from '../../../src/services/assessment.service';
import { UserContext, ValidationError, NotFoundError, ForbiddenError } from '../../../src/types';

// Mock Prisma
jest.mock('../../../src/prismaClient', () => ({
  prisma: {
    assessment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    questionSet: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    question: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  }
}));

import { prisma } from '../../../src/prismaClient';
const mockPrisma = prisma as any;

describe('AssessmentService', () => {
  let assessmentService: AssessmentService;
  let mockTeacher: UserContext;
  let mockAdmin: UserContext;
  let mockStudent: UserContext;

  beforeEach(() => {
    jest.clearAllMocks();
    assessmentService = new AssessmentService();
    
    mockTeacher = {
      id: 'teacher-123',
      email: 'teacher@example.com',
      role: 'TEACHER',
    };

    mockAdmin = {
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    mockStudent = {
      id: 'student-123',
      email: 'student@example.com',
      role: 'STUDENT',
    };
  });

  describe('createAssessment', () => {
    const validAssessmentData = {
      title: 'Test Assessment',
      description: 'Test Description',
      instructions: 'Test Instructions',
      settings: { timeLimit: 60 },
    };

    it('should create assessment successfully for teacher', async () => {
      const mockCreatedAssessment = (global as any).testUtils.createMockAssessment({
        ...validAssessmentData,
        createdBy: mockTeacher.id,
      });

      mockPrisma.assessment.create.mockResolvedValue(mockCreatedAssessment);

      const result = await assessmentService.createAssessment(validAssessmentData, mockTeacher);

      expect(mockPrisma.assessment.create).toHaveBeenCalledWith({
        data: {
          title: validAssessmentData.title,
          description: validAssessmentData.description,
          instructions: validAssessmentData.instructions,
          createdBy: mockTeacher.id,
          settings: validAssessmentData.settings,
        },
      });
      expect(result).toEqual(mockCreatedAssessment);
    });

    it('should create assessment successfully for admin', async () => {
      const mockCreatedAssessment = (global as any).testUtils.createMockAssessment({
        ...validAssessmentData,
        createdBy: mockAdmin.id,
      });

      mockPrisma.assessment.create.mockResolvedValue(mockCreatedAssessment);

      const result = await assessmentService.createAssessment(validAssessmentData, mockAdmin);

      expect(result).toEqual(mockCreatedAssessment);
    });

    it('should create assessment successfully for student', async () => {
      const mockCreatedAssessment = (global as any).testUtils.createMockAssessment({
        ...validAssessmentData,
        createdBy: mockStudent.id,
      });

      mockPrisma.assessment.create.mockResolvedValue(mockCreatedAssessment);

      const result = await assessmentService.createAssessment(validAssessmentData, mockStudent);

      expect(result).toEqual(mockCreatedAssessment);
    });

    it('should handle empty title', async () => {
      const invalidData = { ...validAssessmentData, title: '' };
      const mockCreatedAssessment = (global as any).testUtils.createMockAssessment({
        ...invalidData,
        createdBy: mockTeacher.id,
      });

      mockPrisma.assessment.create.mockResolvedValue(mockCreatedAssessment);

      const result = await assessmentService.createAssessment(invalidData, mockTeacher);

      expect(result).toEqual(mockCreatedAssessment);
    });
  });

  describe('getAssessmentById', () => {
    const assessmentId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return assessment when user is owner', async () => {
      const mockAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(mockAssessment);

      const result = await assessmentService.getAssessmentById(assessmentId, mockTeacher);

      expect(mockPrisma.assessment.findFirst).toHaveBeenCalledWith({
        where: {
          id: assessmentId,
          isActive: true,
          createdBy: mockTeacher.id,
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
      expect(result).toEqual(mockAssessment);
    });

    it('should return assessment for admin', async () => {
      const mockAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(mockAssessment);

      const result = await assessmentService.getAssessmentById(assessmentId, mockAdmin);

      expect(mockPrisma.assessment.findFirst).toHaveBeenCalledWith({
        where: {
          id: assessmentId,
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
      expect(result).toEqual(mockAssessment);
    });

    it('should throw NotFoundError for student trying to access teacher assessment', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.getAssessmentById(assessmentId, mockStudent)
      ).rejects.toThrow(NotFoundError);

      expect(mockPrisma.assessment.findFirst).toHaveBeenCalledWith({
        where: {
          id: assessmentId,
          isActive: true,
          createdBy: mockStudent.id,
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
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.getAssessmentById(assessmentId, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAssessments', () => {
    it('should return assessments for teacher', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];

      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const result = await assessmentService.getAssessments(mockTeacher, 1, 10);

      expect(mockPrisma.assessment.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          createdBy: mockTeacher.id,
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(mockPrisma.assessment.count).toHaveBeenCalledWith({
        where: {
          isActive: true,
          createdBy: mockTeacher.id,
        },
      });

      expect(result).toEqual({
        items: mockAssessments,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should return all assessments for admin', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];

      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const result = await assessmentService.getAssessments(mockAdmin, 1, 10);

      expect(mockPrisma.assessment.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        items: mockAssessments,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];

      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(25);

      const result = await assessmentService.getAssessments(mockTeacher, 3, 10);

      expect(mockPrisma.assessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );

      expect(result).toEqual({
        items: mockAssessments,
        pagination: {
          page: 3,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it('should handle status filter', async () => {
      const mockAssessments = [(global as any).testUtils.createMockAssessment()];

      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);
      mockPrisma.assessment.count.mockResolvedValue(1);

      await assessmentService.getAssessments(mockTeacher, 1, 10, 'PUBLISHED');

      expect(mockPrisma.assessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isActive: true,
            createdBy: mockTeacher.id,
            status: 'PUBLISHED',
          },
        })
      );
    });

    it('should return empty result for student', async () => {
      mockPrisma.assessment.findMany.mockResolvedValue([]);
      mockPrisma.assessment.count.mockResolvedValue(0);

      const result = await assessmentService.getAssessments(mockStudent, 1, 10);

      expect(mockPrisma.assessment.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          createdBy: mockStudent.id,
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe('updateAssessment', () => {
    const assessmentId = '550e8400-e29b-41d4-a716-446655440001';
    const updateData = { title: 'Updated Assessment' };

    it('should update assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
      });

      const updatedAssessment = {
        ...existingAssessment,
        ...updateData,
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(updatedAssessment);

      const result = await assessmentService.updateAssessment(assessmentId, updateData, mockTeacher);

      expect(mockPrisma.assessment.update).toHaveBeenCalledWith({
        where: { id: assessmentId },
        data: {
          title: updateData.title,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedAssessment);
    });

    it('should throw ForbiddenError when user is not owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: 'different-user',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);

      await expect(
        assessmentService.updateAssessment(assessmentId, updateData, mockTeacher)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError for student trying to update teacher assessment', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.updateAssessment(assessmentId, updateData, mockStudent)
      ).rejects.toThrow(NotFoundError);

      expect(mockPrisma.assessment.findFirst).toHaveBeenCalledWith({
        where: {
          id: assessmentId,
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
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.updateAssessment(assessmentId, updateData, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAssessment', () => {
    const assessmentId = '550e8400-e29b-41d4-a716-446655440002';

    it('should delete assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
      });

      const deletedAssessment = {
        ...existingAssessment,
        isActive: false,
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(deletedAssessment);

      const result = await assessmentService.deleteAssessment(assessmentId, mockTeacher);

      expect(mockPrisma.assessment.update).toHaveBeenCalledWith({
        where: { id: assessmentId },
        data: { isActive: false },
      });
      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenError when user is not owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: 'different-user',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);

      await expect(
        assessmentService.deleteAssessment(assessmentId, mockTeacher)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError for student trying to delete teacher assessment', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.deleteAssessment(assessmentId, mockStudent)
      ).rejects.toThrow(NotFoundError);

      expect(mockPrisma.assessment.findFirst).toHaveBeenCalledWith({
        where: {
          id: assessmentId,
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
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.deleteAssessment(assessmentId, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('publishAssessment', () => {
    const assessmentId = '550e8400-e29b-41d4-a716-446655440003';

    it('should publish assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
        status: 'DRAFT',
        questionSets: [
          {
            id: 'set-1',
            questions: [
              { id: 'q1', title: 'Question 1' },
              { id: 'q2', title: 'Question 2' },
            ],
          },
        ],
      });

      const publishedAssessment = {
        ...existingAssessment,
        status: 'PUBLISHED',
      };

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.update.mockResolvedValue(publishedAssessment);

      const result = await assessmentService.publishAssessment(assessmentId, mockTeacher);

      expect(mockPrisma.assessment.update).toHaveBeenCalledWith({
        where: { id: assessmentId },
        data: { status: 'PUBLISHED' },
      });
      expect(result).toEqual(publishedAssessment);
    });

    it('should throw ValidationError when assessment is already published', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
        status: 'PUBLISHED',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);

      await expect(
        assessmentService.publishAssessment(assessmentId, mockTeacher)
      ).rejects.toThrow(ValidationError);

      expect(mockPrisma.assessment.update).not.toHaveBeenCalled();
    });
  });

  describe('duplicateAssessment', () => {
    const assessmentId = '550e8400-e29b-41d4-a716-446655440004';

    it('should duplicate assessment successfully', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        title: 'Original Assessment',
        createdBy: 'original-creator',
      });

      const duplicatedAssessment = (global as any).testUtils.createMockAssessment({
        id: 'new-assessment-id',
        title: 'Original Assessment (Copy)',
        createdBy: mockTeacher.id,
        status: 'DRAFT',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.create.mockResolvedValue(duplicatedAssessment);

      const result = await assessmentService.duplicateAssessment(assessmentId, mockTeacher);

      expect(mockPrisma.assessment.create).toHaveBeenCalledWith({
        data: {
          title: 'Original Assessment (Copy)',
          description: existingAssessment.description,
          instructions: existingAssessment.instructions,
          settings: existingAssessment.settings,
          createdBy: mockTeacher.id,
          status: 'DRAFT',
        },
      });
      expect(result).toEqual(duplicatedAssessment);
    });

    it('should throw NotFoundError for student trying to duplicate teacher assessment', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.duplicateAssessment(assessmentId, mockStudent)
      ).rejects.toThrow(NotFoundError);

      expect(mockPrisma.assessment.findFirst).toHaveBeenCalledWith({
        where: {
          id: assessmentId,
          isActive: true,
          createdBy: mockStudent.id,
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
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.duplicateAssessment(assessmentId, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });
});