import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SubmissionService } from '../services/submission.service';
import { extractUserContext, requireStudent, requireTeacherOrAdmin } from '../middleware/userContext';
import { ApiResponse, ValidationError } from '../types';

const router = Router();
const submissionService = new SubmissionService();

// Apply user context extraction to all routes
router.use(extractUserContext);

// Validation middleware
const validateRequest = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }
  next();
};

/**
 * @route   POST /api/submissions
 * @desc    Create a new submission
 * @access  Students only
 */
router.post(
  '/',
  requireStudent,
  [
    body('assessmentId')
      .notEmpty()
      .withMessage('Assessment ID is required')
      .isString()
      .withMessage('Assessment ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await submissionService.createSubmission(req.body, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: submission,
        message: 'Submission created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get submission by ID
 * @access  Students (own submissions), Teachers, Admins
 */
router.get(
  '/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await submissionService.getSubmissionById(req.params.id, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: submission
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/submissions
 * @desc    Get submissions with filtering
 * @access  Students (own submissions), Teachers, Admins
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('assessmentId')
      .optional()
      .isString()
      .withMessage('Assessment ID must be a string'),
    query('studentId')
      .optional()
      .isString()
      .withMessage('Student ID must be a string'),
    query('status')
      .optional()
      .isIn(['DRAFT', 'SUBMITTED', 'GRADING', 'GRADED', 'PUBLISHED', 'ARCHIVED'])
      .withMessage('Invalid status'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await submissionService.getSubmissions({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        assessmentId: req.query.assessmentId as string,
        studentId: req.query.studentId as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      }, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: result.submissions,
        meta: result.meta
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/submissions/assessment/:assessmentId
 * @desc    Get submission by assessment ID
 * @access  Students (own submission), Teachers, Admins
 */
router.get(
  '/assessment/:assessmentId',
  [
    param('assessmentId')
      .notEmpty()
      .withMessage('Assessment ID is required')
      .isString()
      .withMessage('Assessment ID must be a string'),
    query('studentId')
      .optional()
      .isString()
      .withMessage('Student ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await submissionService.getSubmissionByAssessment(
        req.params.assessmentId,
        req.query.studentId as string,
        req.user
      );
      
      const response: ApiResponse = {
        success: true,
        data: submission
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/submissions/:id
 * @desc    Update submission
 * @access  Students (own submissions), Teachers, Admins
 */
router.put(
  '/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    body('status')
      .optional()
      .isIn(['DRAFT', 'SUBMITTED', 'GRADING', 'GRADED', 'PUBLISHED', 'ARCHIVED'])
      .withMessage('Invalid status'),
    body('score')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Score must be a positive number'),
    body('maxScore')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max score must be a positive number'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await submissionService.updateSubmission(req.params.id, req.body, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: submission,
        message: 'Submission updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/submissions/:id/submit
 * @desc    Submit a submission (mark as completed)
 * @access  Students (own submissions)
 */
router.post(
  '/:id/submit',
  requireStudent,
  [
    param('id')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await submissionService.submitSubmission(req.params.id, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: submission,
        message: 'Submission submitted successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/submissions/:id/answers
 * @desc    Save/update answers in submission
 * @access  Students (own submissions)
 */
router.post(
  '/:id/answers',
  requireStudent,
  [
    param('id')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    body('answers')
      .notEmpty()
      .withMessage('Answers are required'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await submissionService.saveAnswers(req.params.id, req.body.answers, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: submission,
        message: 'Answers saved successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/submissions/stats/:assessmentId
 * @desc    Get submission statistics for an assessment
 * @access  Teachers, Admins
 */
router.get(
  '/stats/:assessmentId',
  requireTeacherOrAdmin,
  [
    param('assessmentId')
      .notEmpty()
      .withMessage('Assessment ID is required')
      .isString()
      .withMessage('Assessment ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await submissionService.getSubmissionStats(req.params.assessmentId, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Delete submission
 * @access  Admins only
 */
router.delete(
  '/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Submission ID is required')
      .isString()
      .withMessage('Submission ID must be a string'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await submissionService.deleteSubmission(req.params.id, req.user);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: result.message
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;