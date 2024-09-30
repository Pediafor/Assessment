import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AssessmentService } from '../services/assessment.service';
import { extractUserContext, requireTeacherOrAdmin } from '../middleware/userContext';
import { ApiResponse, ValidationError } from '../types';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const assessmentService = new AssessmentService();

// Apply user context extraction to all routes
router.use(extractUserContext);

/**
 * Validation middleware
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
  }
  next();
};

/**
 * POST /assessments - Create new assessment
 */
router.post(
  '/',
  requireTeacherOrAdmin,
  [
    body('title')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('instructions')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Instructions must not exceed 2000 characters'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const assessment = await assessmentService.createAssessment(req.body, req.user);
    
    const response: ApiResponse = {
      success: true,
      data: assessment,
      message: 'Assessment created successfully',
      timestamp: new Date().toISOString(),
    };
    
    res.status(201).json(response);
  }
);

/**
 * GET /assessments - Get all assessments
 */
router.get(
  '/',
  requireTeacherOrAdmin,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'])
      .withMessage('Status must be one of: DRAFT, PUBLISHED, ARCHIVED, SCHEDULED'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await assessmentService.getAssessments(req.user, page, limit, status);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  }
);

/**
 * GET /assessments/:id - Get assessment by ID
 */
router.get(
  '/:id',
  requireTeacherOrAdmin,
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Assessment ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const assessment = await assessmentService.getAssessmentById(req.params.id, req.user);
    
    const response: ApiResponse = {
      success: true,
      data: assessment,
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  }
);

/**
 * PUT /assessments/:id - Update assessment
 */
router.put(
  '/:id',
  requireTeacherOrAdmin,
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Assessment ID is required'),
    body('title')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('instructions')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Instructions must not exceed 2000 characters'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const assessment = await assessmentService.updateAssessment(req.params.id, req.body, req.user);
    
    const response: ApiResponse = {
      success: true,
      data: assessment,
      message: 'Assessment updated successfully',
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  }
);

/**
 * DELETE /assessments/:id - Delete assessment
 */
router.delete(
  '/:id',
  requireTeacherOrAdmin,
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Assessment ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    await assessmentService.deleteAssessment(req.params.id, req.user);
    
    const response: ApiResponse = {
      success: true,
      message: 'Assessment deleted successfully',
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  }
);

/**
 * POST /assessments/:id/publish - Publish assessment
 */
router.post(
  '/:id/publish',
  requireTeacherOrAdmin,
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Assessment ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const assessment = await assessmentService.publishAssessment(req.params.id, req.user);
    
    const response: ApiResponse = {
      success: true,
      data: assessment,
      message: 'Assessment published successfully',
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  }
);

/**
 * POST /assessments/:id/duplicate - Duplicate assessment
 */
router.post(
  '/:id/duplicate',
  requireTeacherOrAdmin,
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Assessment ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const assessment = await assessmentService.duplicateAssessment(req.params.id, req.user);
    
    const response: ApiResponse = {
      success: true,
      data: assessment,
      message: 'Assessment duplicated successfully',
      timestamp: new Date().toISOString(),
    };
    
    res.status(201).json(response);
  }
);

export default router;