import { PrismaClient } from '@prisma/client';
import { MCQGradingEngine } from './gradingEngine';
import { 
  GradingRequest, 
  GradingResponse, 
  GradeResult, 
  Assessment, 
  Submission, 
  GradingConfig as ConfigType,
  QuestionGradeResult 
} from '../types';
import { getGradingEventPublisher } from '../events/publisher';

export class GradingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Grade a submission automatically
   */
  async gradeSubmission(request: GradingRequest): Promise<GradingResponse> {
    try {
      const { submissionId, forceRegrade = false } = request;

      // Check if already graded and not forcing regrade
      const existingGrade = await this.prisma.grade.findUnique({
        where: { submissionId },
        include: { questionGrades: true }
      });

      if (existingGrade && !forceRegrade) {
        return {
          success: true,
          grade: this.mapPrismaGradeToResult(existingGrade),
          message: 'Submission already graded'
        };
      }

      // Fetch submission data from submission service
      const submission = await this.fetchSubmissionData(submissionId);
      if (!submission) {
        return {
          success: false,
          error: 'Submission not found'
        };
      }

      // Fetch assessment data from assessment service
      const assessment = await this.fetchAssessmentData(submission.assessmentId);
      if (!assessment) {
        return {
          success: false,
          error: 'Assessment not found'
        };
      }

      // Get grading configuration
      const gradingConfig = await this.getGradingConfig(submission.assessmentId);

      // Perform grading
      const gradeResult = await this.performGrading(submission, assessment, gradingConfig);

      // Save grade to database
      const savedGrade = await this.saveGrade(gradeResult);

      // Publish grading completed event
      try {
        const eventPublisher = getGradingEventPublisher();
        await eventPublisher.ensureConnection();

        const gradingEventData = {
          submissionId: gradeResult.submissionId,
          assessmentId: gradeResult.assessmentId,
          studentId: gradeResult.userId,
          totalMarks: gradeResult.maxScore,
          calculatedMarks: gradeResult.totalScore,
          percentage: gradeResult.percentage,
          gradedAt: gradeResult.gradedAt.toISOString(),
          gradingStatus: 'SUCCESS' as const,
          questionsGraded: gradeResult.questionGrades.length,
          totalQuestions: gradeResult.questionGrades.length
        };

        const metadata = {
          correlationId: `grading-${gradeResult.submissionId}-${Date.now()}`,
          userId: gradeResult.userId,
          source: 'grading-service'
        };

        await eventPublisher.publishGradingCompleted(gradingEventData, metadata);
        console.log(`📤 Published grading.completed event for submission ${gradeResult.submissionId}`);
      } catch (error) {
        console.error('⚠️ Failed to publish grading completed event:', error);
        // Don't fail the grading if event publishing fails
      }

      return {
        success: true,
        grade: gradeResult,
        message: 'Submission graded successfully'
      };

    } catch (error) {
      console.error('Error grading submission:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Perform the actual grading logic
   */
  private async performGrading(
    submission: Submission,
    assessment: Assessment,
    config: ConfigType
  ): Promise<GradeResult> {
    const questionGrades: QuestionGradeResult[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // Grade each question
    for (const question of assessment.questions) {
      maxScore += question.points;
      
      const studentAnswer = submission.answers[question.id];
      let questionGrade: QuestionGradeResult;

      // Grade based on question type
      switch (question.type) {
        case 'multiple_choice':
          questionGrade = MCQGradingEngine.gradeMultipleChoice(question, studentAnswer, config);
          break;
        
        case 'true_false':
          questionGrade = MCQGradingEngine.gradeTrueFalse(question, studentAnswer, config);
          break;
        
        case 'text':
          // Text questions require manual grading
          questionGrade = {
            questionId: question.id,
            pointsEarned: 0,
            maxPoints: question.points,
            isCorrect: null,
            studentAnswer,
            correctAnswer: question.correctAnswer,
            feedback: 'This question requires manual grading'
          };
          break;
        
        case 'file_upload':
          // File upload questions require manual grading
          questionGrade = {
            questionId: question.id,
            pointsEarned: 0,
            maxPoints: question.points,
            isCorrect: null,
            studentAnswer,
            correctAnswer: question.correctAnswer,
            feedback: 'File submissions require manual review'
          };
          break;
        
        default:
          questionGrade = {
            questionId: question.id,
            pointsEarned: 0,
            maxPoints: question.points,
            isCorrect: false,
            studentAnswer,
            correctAnswer: question.correctAnswer,
            feedback: 'Unsupported question type'
          };
      }

      questionGrades.push(questionGrade);
      totalScore += questionGrade.pointsEarned;
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      submissionId: submission.id,
      assessmentId: submission.assessmentId,
      userId: submission.userId,
      totalScore,
      maxScore,
      percentage,
      questionGrades,
      gradedAt: new Date(),
      isAutomated: true,
      feedback: this.generateOverallFeedback(percentage, totalScore, maxScore)
    };
  }

  /**
   * Save grade result to database
   */
  private async saveGrade(gradeResult: GradeResult) {
    const { questionGrades, ...gradeData } = gradeResult;

    // Upsert the main grade record
    const grade = await this.prisma.grade.upsert({
      where: { submissionId: gradeResult.submissionId },
      create: {
        ...gradeData,
        questionGrades: {
          create: questionGrades.map(qg => ({
            questionId: qg.questionId,
            pointsEarned: qg.pointsEarned,
            maxPoints: qg.maxPoints,
            isCorrect: qg.isCorrect,
            studentAnswer: qg.studentAnswer,
            correctAnswer: qg.correctAnswer,
            feedback: qg.feedback || null
          }))
        }
      },
      update: {
        ...gradeData,
        questionGrades: {
          deleteMany: {},
          create: questionGrades.map(qg => ({
            questionId: qg.questionId,
            pointsEarned: qg.pointsEarned,
            maxPoints: qg.maxPoints,
            isCorrect: qg.isCorrect,
            studentAnswer: qg.studentAnswer,
            correctAnswer: qg.correctAnswer,
            feedback: qg.feedback || null
          }))
        }
      },
      include: {
        questionGrades: true
      }
    });

    return grade;
  }

  /**
   * Get grading configuration for an assessment
   */
  private async getGradingConfig(assessmentId: string): Promise<ConfigType> {
    const config = await this.prisma.gradingConfig.findUnique({
      where: { assessmentId }
    });

    return config ? {
      id: config.id,
      assessmentId: config.assessmentId,
      gradingMethod: config.gradingMethod as 'automated' | 'manual' | 'hybrid',
      allowPartialCredit: config.allowPartialCredit,
      penaltyPerWrongAnswer: config.penaltyPerWrongAnswer || undefined,
      mcqScoringType: config.mcqScoringType as 'standard' | 'partial_credit' | 'negative_marking',
      autoGradeOnSubmit: config.autoGradeOnSubmit,
      releaseGradesImmediately: config.releaseGradesImmediately,
      showCorrectAnswers: config.showCorrectAnswers,
      showFeedback: config.showFeedback
    } : this.getDefaultGradingConfig(assessmentId);
  }

  /**
   * Get default grading configuration
   */
  private getDefaultGradingConfig(assessmentId: string): ConfigType {
    return {
      id: 'default',
      assessmentId,
      gradingMethod: 'automated',
      allowPartialCredit: true,
      mcqScoringType: 'standard',
      autoGradeOnSubmit: true,
      releaseGradesImmediately: false,
      showCorrectAnswers: false,
      showFeedback: true
    };
  }

  /**
   * Generate overall feedback based on performance
   */
  private generateOverallFeedback(percentage: number, totalScore: number, maxScore: number): string {
    if (percentage >= 90) {
      return `Excellent work! You scored ${totalScore}/${maxScore} (${percentage.toFixed(1)}%). Outstanding performance!`;
    } else if (percentage >= 80) {
      return `Great job! You scored ${totalScore}/${maxScore} (${percentage.toFixed(1)}%). Well done!`;
    } else if (percentage >= 70) {
      return `Good work! You scored ${totalScore}/${maxScore} (${percentage.toFixed(1)}%). Keep it up!`;
    } else if (percentage >= 60) {
      return `You scored ${totalScore}/${maxScore} (${percentage.toFixed(1)}%). There's room for improvement.`;
    } else {
      return `You scored ${totalScore}/${maxScore} (${percentage.toFixed(1)}%). Please review the material and try again.`;
    }
  }

  /**
   * Fetch submission data from submission service
   */
  private async fetchSubmissionData(submissionId: string): Promise<Submission | null> {
    try {
      // In a real implementation, this would make an HTTP request to the submission service
      // For now, we'll simulate the data structure
      return {
        id: submissionId,
        userId: 'user123',
        assessmentId: 'assessment123',
        answers: {},
        status: 'submitted',
        submittedAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching submission data:', error);
      return null;
    }
  }

  /**
   * Fetch assessment data from assessment service
   */
  private async fetchAssessmentData(assessmentId: string): Promise<Assessment | null> {
    try {
      // In a real implementation, this would make an HTTP request to the assessment service
      // For now, we'll simulate the data structure
      return {
        id: assessmentId,
        title: 'Sample Assessment',
        questions: [],
        totalPoints: 0
      };
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      return null;
    }
  }

  /**
   * Convert Prisma grade to GradeResult
   */
  private mapPrismaGradeToResult(prismaGrade: any): GradeResult {
    return {
      submissionId: prismaGrade.submissionId,
      assessmentId: prismaGrade.assessmentId,
      userId: prismaGrade.userId,
      totalScore: prismaGrade.totalScore,
      maxScore: prismaGrade.maxScore,
      percentage: prismaGrade.percentage,
      questionGrades: prismaGrade.questionGrades.map((qg: any) => ({
        questionId: qg.questionId,
        pointsEarned: qg.pointsEarned,
        maxPoints: qg.maxPoints,
        isCorrect: qg.isCorrect,
        studentAnswer: qg.studentAnswer,
        correctAnswer: qg.correctAnswer,
        feedback: qg.feedback
      })),
      gradedAt: prismaGrade.gradedAt,
      isAutomated: prismaGrade.isAutomated,
      feedback: prismaGrade.feedback
    };
  }

  /**
   * Get grade by submission ID
   */
  async getGradeBySubmissionId(submissionId: string): Promise<GradeResult | null> {
    try {
      const grade = await this.prisma.grade.findUnique({
        where: { submissionId },
        include: { questionGrades: true }
      });

      return grade ? this.mapPrismaGradeToResult(grade) : null;
    } catch (error) {
      console.error('Error fetching grade:', error);
      return null;
    }
  }

  /**
   * Get grades for a user
   */
  async getGradesByUserId(userId: string): Promise<GradeResult[]> {
    try {
      const grades = await this.prisma.grade.findMany({
        where: { userId },
        include: { questionGrades: true },
        orderBy: { gradedAt: 'desc' }
      });

      return grades.map(grade => this.mapPrismaGradeToResult(grade));
    } catch (error) {
      console.error('Error fetching user grades:', error);
      return [];
    }
  }

  /**
   * Get grades for an assessment
   */
  async getGradesByAssessmentId(assessmentId: string): Promise<GradeResult[]> {
    try {
      const grades = await this.prisma.grade.findMany({
        where: { assessmentId },
        include: { questionGrades: true },
        orderBy: { gradedAt: 'desc' }
      });

      return grades.map(grade => this.mapPrismaGradeToResult(grade));
    } catch (error) {
      console.error('Error fetching assessment grades:', error);
      return [];
    }
  }

  /**
   * Update feedback for a submission
   */
  async updateFeedback(submissionId: string, feedback: string, gradedBy: string): Promise<GradingResponse> {
    try {
      const updatedGrade = await this.prisma.grade.update({
        where: { submissionId },
        data: {
          feedback,
          gradedBy,
          isAutomated: false,
          updatedAt: new Date(),
        },
        include: { questionGrades: true },
      });

      // Publish feedback updated event
      const eventPublisher = getGradingEventPublisher();
      await eventPublisher.ensureConnection();
      await eventPublisher.publishFeedbackUpdated({
        submissionId,
        assessmentId: updatedGrade.assessmentId,
        studentId: updatedGrade.userId,
        feedback,
        updatedBy: gradedBy,
        updatedAt: updatedGrade.updatedAt.toISOString(),
      }, {
        correlationId: `feedback-${submissionId}-${Date.now()}`,
        userId: gradedBy,
        source: 'grading-service',
      });

      return {
        success: true,
        grade: this.mapPrismaGradeToResult(updatedGrade),
        message: 'Feedback updated successfully',
      };
    } catch (error) {
      console.error('Error updating feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Return a lightweight queue of items requiring manual grading.
   * For now, derive from grades that contain any question with isCorrect === null or text/file types.
   * In a more complete system, we'd query submissions in 'submitted' state with manual questions.
   */
  async getManualGradingQueue(): Promise<Array<{
    id: string;
    submissionId: string;
    assessmentId: string;
    studentId: string;
    submittedAt?: string;
    status: 'New' | 'Pending' | 'Urgent';
    assessment?: string;
    student?: string;
  }>> {
    try {
      // Heuristic: find latest grades where some question needs manual review
      const grades = await this.prisma.grade.findMany({
        include: { questionGrades: true },
        orderBy: { gradedAt: 'desc' },
        take: 50,
      });

      const needsManual = grades.filter(g =>
        g.questionGrades.some(q => q.isCorrect === null)
      );

      return needsManual.map(g => ({
        id: g.id,
        submissionId: g.submissionId,
        assessmentId: g.assessmentId,
        studentId: g.userId,
        status: 'New',
        submittedAt: g.gradedAt?.toISOString(),
      }));
    } catch (error) {
      console.error('Error building manual grading queue:', error);
      return [];
    }
  }

  /**
   * Compute simple teacher overview statistics.
   */
  async getTeacherOverviewStats(): Promise<{ avgScore: number | null; completed: number; pendingGrading: number; }>{
    try {
      const [count, aggregates] = await Promise.all([
        this.prisma.grade.count(),
        this.prisma.grade.aggregate({ _avg: { percentage: true } }),
      ]);

      // Pending grading heuristic: question grades with isCorrect === null
      const pendingGrading = await this.prisma.questionGrade.count({ where: { isCorrect: null } });

      return {
        avgScore: aggregates._avg.percentage ? Number(aggregates._avg.percentage) : null,
        completed: count,
        pendingGrading,
      };
    } catch (error) {
      console.error('Error computing teacher overview stats:', error);
      return { avgScore: null, completed: 0, pendingGrading: 0 };
    }
  }

  /**
   * Manually grade a specific question within a submission grade.
   */
  async manualGradeQuestion(params: {
    submissionId: string;
    questionId: string;
    pointsEarned: number;
    feedback: string | null;
    gradedBy: string;
  }): Promise<GradingResponse> {
    const { submissionId, questionId, pointsEarned, feedback, gradedBy } = params;
    try {
      // Find existing grade
      const grade = await this.prisma.grade.findUnique({
        where: { submissionId },
        include: { questionGrades: true },
      });
      if (!grade) {
        return { success: false, error: 'Grade not found for submission' };
      }

      // Find the question grade and its maxPoints
      const qg = grade.questionGrades.find(q => q.questionId === questionId);
      if (!qg) {
        return { success: false, error: 'Question not found in grade' };
      }
      const boundedPoints = Math.max(0, Math.min(pointsEarned, qg.maxPoints));

      // Update the question grade
      await this.prisma.questionGrade.update({
        where: { id: qg.id },
        data: {
          pointsEarned: boundedPoints,
          isCorrect: null, // manual grading may not be strictly true/false
          feedback: feedback,
        },
      });

      // Recalculate totals
      const updatedQGs = await this.prisma.questionGrade.findMany({ where: { gradeId: grade.id } });
      const totalScore = updatedQGs.reduce((sum, item) => sum + (item.pointsEarned ?? 0), 0);
      const maxScore = updatedQGs.reduce((sum, item) => sum + (item.maxPoints ?? 0), 0);
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      const updatedGrade = await this.prisma.grade.update({
        where: { id: grade.id },
        data: {
          totalScore,
          maxScore,
          percentage,
          gradedBy,
          isAutomated: false,
          updatedAt: new Date(),
        },
        include: { questionGrades: true },
      });

      return {
        success: true,
        grade: this.mapPrismaGradeToResult(updatedGrade),
        message: 'Question graded successfully',
      };
    } catch (error) {
      console.error('Error in manualGradeQuestion:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Cleanup resources
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}