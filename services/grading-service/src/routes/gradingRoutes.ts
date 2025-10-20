import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { GradingService } from '../services/gradingService';
import { UserContext } from '../types';

const router = express.Router();
const gradingService = new GradingService();

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

/**
 * Grade a submission
 * POST /api/grade
 */
router.post(
  '/',
  [
    body('submissionId').isString().notEmpty().withMessage('Submission ID is required'),
    body('forceRegrade').optional().isBoolean().withMessage('Force regrade must be a boolean'),
    handleValidationErrors
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;
      const { submissionId, forceRegrade = false } = req.body;

      // Authorization: Only teachers and admins can grade submissions
      if (!['teacher', 'admin'].includes(userContext.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to grade submissions'
        });
        return;
      }

      const result = await gradingService.gradeSubmission({
        submissionId,
        forceRegrade
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in grade submission endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Get grading queue (items requiring manual review)
 * GET /api/grade/queue
 */
router.get(
  '/queue',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;

      // Authorization: Only teachers and admins can access the grading queue
      if (!['teacher', 'admin'].includes(userContext.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view grading queue'
        });
        return;
      }

      const items = await gradingService.getManualGradingQueue();

      res.status(200).json({
        success: true,
        data: { items }
      });
    } catch (error) {
      console.error('Error fetching grading queue:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Get grade by submission ID
 * GET /api/grade/submission/:submissionId
 */
router.get(
  '/submission/:submissionId',
  [
    param('submissionId').isString().notEmpty().withMessage('Submission ID is required'),
    handleValidationErrors
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;
      const { submissionId } = req.params;

      const grade = await gradingService.getGradeBySubmissionId(submissionId);

      if (!grade) {
        res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
        return;
      }

      // Authorization: Students can only see their own grades
      if (userContext.role === 'student' && grade.userId !== userContext.userId) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view this grade'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: grade
      });
    } catch (error) {
      console.error('Error fetching grade by submission:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Update feedback for a submission
 * PUT /api/grade/submission/:submissionId/feedback
 */
router.put(
  '/submission/:submissionId/feedback',
  [
    param('submissionId').isString().notEmpty().withMessage('Submission ID is required'),
    body('feedback').isString().notEmpty().withMessage('Feedback is required'),
    handleValidationErrors
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;
      const { submissionId } = req.params;
      const { feedback } = req.body;

      // Authorization: Only teachers and admins can update feedback
      if (!['teacher', 'admin'].includes(userContext.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update feedback'
        });
        return;
      }

      const result = await gradingService.updateFeedback(submissionId, feedback, userContext.userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in update feedback endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Manually grade a specific question within a submission
 * PUT /api/grade/submission/:submissionId/question/:questionId
 */
router.put(
  '/submission/:submissionId/question/:questionId',
  [
    param('submissionId').isString().notEmpty().withMessage('Submission ID is required'),
    param('questionId').isString().notEmpty().withMessage('Question ID is required'),
    body('pointsEarned').isFloat({ min: 0 }).withMessage('pointsEarned must be a non-negative number'),
    body('feedback').optional().isString().withMessage('feedback must be a string'),
    handleValidationErrors
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;
      const { submissionId, questionId } = req.params;
      const { pointsEarned, feedback } = req.body as { pointsEarned: number; feedback?: string };

      if (!['teacher', 'admin'].includes(userContext.role)) {
        res.status(403).json({ success: false, error: 'Insufficient permissions to grade' });
        return;
      }

      const result = await gradingService.manualGradeQuestion({
        submissionId,
        questionId,
        pointsEarned: Number(pointsEarned),
        feedback: feedback ?? null,
        gradedBy: userContext.userId
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in manual question grading endpoint:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

/**
 * Get grades by user ID
 * GET /api/grade/user/:userId
 */
router.get(
  '/user/:userId',
  [
    param('userId').isString().notEmpty().withMessage('User ID is required'),
    handleValidationErrors
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;
      const { userId } = req.params;

      // Authorization: Students can only see their own grades
      if (userContext.role === 'student' && userId !== userContext.userId) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view these grades'
        });
        return;
      }

      const grades = await gradingService.getGradesByUserId(userId);

      res.status(200).json({
        success: true,
        data: grades
      });
    } catch (error) {
      console.error('Error fetching grades by user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Get grades by assessment ID
 * GET /api/grade/assessment/:assessmentId
 */
router.get(
  '/assessment/:assessmentId',
  [
    param('assessmentId').isString().notEmpty().withMessage('Assessment ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;
      const { assessmentId } = req.params;

      // Authorization: Only teachers and admins can see all grades for an assessment
      if (!['teacher', 'admin'].includes(userContext.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view assessment grades'
        });
        return;
      }

      const grades = await gradingService.getGradesByAssessmentId(assessmentId);

      res.status(200).json({
        success: true,
        data: grades,
        total: grades.length
      });
    } catch (error) {
      console.error('Error fetching grades by assessment:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Teacher overview analytics
 * GET /api/grade/analytics/teacher/overview
 */
router.get(
  '/analytics/teacher/overview',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;

      if (!['teacher', 'admin'].includes(userContext.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view analytics'
        });
        return;
      }

      const overview = await gradingService.getTeacherOverviewStats();

      res.status(200).json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Error fetching teacher overview analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * Get my grades (for current user)
 * GET /api/grade/my-grades
 */
router.get(
  '/my-grades',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userContext = req.user as UserContext;

      const grades = await gradingService.getGradesByUserId(userContext.userId);

      res.status(200).json({
        success: true,
        data: grades
      });
    } catch (error) {
      console.error('Error fetching my grades:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

export default router;