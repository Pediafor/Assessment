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
          ...validAssessmentData,
          createdBy: mockTeacher.id,
          status: 'DRAFT',
          isActive: true,
        },
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
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

    it('should throw ForbiddenError for student', async () => {
      await expect(
        assessmentService.createAssessment(validAssessmentData, mockStudent)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for missing title', async () => {
      const invalidData = { ...validAssessmentData, title: '' };

      await expect(
        assessmentService.createAssessment(invalidData, mockTeacher)
      ).rejects.toThrow(ValidationError);

      expect(mockPrisma.assessment.create).not.toHaveBeenCalled();
    });
  });

  describe('getAssessmentById', () => {
    const assessmentId = 'assessment-123';

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
        },
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
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

      expect(result).toEqual(mockAssessment);
    });

    it('should throw ForbiddenError for student', async () => {
      await expect(
        assessmentService.getAssessmentById(assessmentId, mockStudent)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.findFirst).not.toHaveBeenCalled();
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
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
                    },
                  },
                },
                orderBy: { displayOrder: 'asc' },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
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
        assessments: mockAssessments,
        total: 1,
        page: 1,
        totalPages: 1,
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
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
                    },
                  },
                },
                orderBy: { displayOrder: 'asc' },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        assessments: mockAssessments,
        total: 1,
        page: 1,
        totalPages: 1,
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
        assessments: mockAssessments,
        total: 25,
        page: 3,
        totalPages: 3,
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

    it('should throw ForbiddenError for student', async () => {
      await expect(
        assessmentService.getAssessments(mockStudent, 1, 10)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.findMany).not.toHaveBeenCalled();
    });
  });

  describe('updateAssessment', () => {
    const assessmentId = 'assessment-123';
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
        data: updateData,
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
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

    it('should throw ForbiddenError for student', async () => {
      await expect(
        assessmentService.updateAssessment(assessmentId, updateData, mockStudent)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.updateAssessment(assessmentId, updateData, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAssessment', () => {
    const assessmentId = 'assessment-123';

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
      expect(result).toEqual(deletedAssessment);
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

    it('should throw ForbiddenError for student', async () => {
      await expect(
        assessmentService.deleteAssessment(assessmentId, mockStudent)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.deleteAssessment(assessmentId, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('publishAssessment', () => {
    const assessmentId = 'assessment-123';

    it('should publish assessment successfully when user is owner', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        createdBy: mockTeacher.id,
        status: 'DRAFT',
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
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
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
    const assessmentId = 'assessment-123';

    it('should duplicate assessment successfully', async () => {
      const existingAssessment = (global as any).testUtils.createMockAssessment({
        id: assessmentId,
        title: 'Original Assessment',
        createdBy: 'original-creator',
      });

      const duplicatedAssessment = (global as any).testUtils.createMockAssessment({
        id: 'new-assessment-id',
        title: 'Copy of Original Assessment',
        createdBy: mockTeacher.id,
        status: 'DRAFT',
      });

      mockPrisma.assessment.findFirst.mockResolvedValue(existingAssessment);
      mockPrisma.assessment.create.mockResolvedValue(duplicatedAssessment);

      const result = await assessmentService.duplicateAssessment(assessmentId, mockTeacher);

      expect(mockPrisma.assessment.create).toHaveBeenCalledWith({
        data: {
          title: 'Copy of Original Assessment',
          description: existingAssessment.description,
          instructions: existingAssessment.instructions,
          settings: existingAssessment.settings,
          createdBy: mockTeacher.id,
          status: 'DRAFT',
          isActive: true,
        },
        include: {
          questionSets: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
                include: {
                  mediaItems: { where: { isActive: true } },
                  options: {
                    where: { isActive: true },
                    include: {
                      mediaItems: { where: { isActive: true } },
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
      expect(result).toEqual(duplicatedAssessment);
    });

    it('should throw ForbiddenError for student', async () => {
      await expect(
        assessmentService.duplicateAssessment(assessmentId, mockStudent)
      ).rejects.toThrow(ForbiddenError);

      expect(mockPrisma.assessment.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when assessment not found', async () => {
      mockPrisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        assessmentService.duplicateAssessment(assessmentId, mockTeacher)
      ).rejects.toThrow(NotFoundError);
    });
  });
});