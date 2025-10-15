import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AssessmentService } from '../services/assessment.service';
import { extractUserContext, requireTeacherOrAdmin } from '../middleware/userContext';
import { ApiResponse, ValidationError } from '../types';
import { Request, Response, NextFunction } from 'express';
import { getEventPublisher } from '../events/publisher';

const router = Router();
const assessmentService = new AssessmentService();
const eventPublisher = getEventPublisher();

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
 * GET /assessments - Get assessments
 * - Students: only PUBLISHED
 * - Teachers/Admins: own/all with optional status filter
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
    query('status')
      .optional()
      .isString()
      .withMessage('Status must be a string'),
    handleValidationErrors
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await assessmentService.getAssessments(
        req.user,
        req.query.page ? parseInt(req.query.page as string) : 1,
        req.query.limit ? parseInt(req.query.limit as string) : 10,
        req.query.status as string
      );
      const response: ApiResponse = {
        success: true,
        data: {
          assessments: result.items,
          meta: result.pagination,
        },
        timestamp: new Date().toISOString(),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /assessments - Get all assessments
 */
// Removed duplicate route: consolidated into the role-aware GET /assessments above

/**
 * GET /assessments/:id - Get assessment by ID
 */
router.get(
  '/:id',
  requireTeacherOrAdmin,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid assessment ID'),
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
      .isUUID()
      .withMessage('Invalid assessment ID'),
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
    body('deadline')
      .optional()
      .isISO8601()
      .withMessage('Deadline must be a valid ISO 8601 date')
      .toDate()
      .custom((value) => {
        if (value < new Date()) {
          throw new Error('Deadline must be in the future');
        }
        return true;
      }),
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
      .isUUID()
      .withMessage('Invalid assessment ID'),
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
      .isUUID()
      .withMessage('Invalid assessment ID'),
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
 * GET /assessments/:id/ownership/:teacherId - Check if teacher owns this assessment
 * Note: Simple check without auth for realtime filtering; secure routes use middleware above.
 */
router.get(
  '/:id/ownership/:teacherId',
  async (req: Request, res: Response) => {
    try {
      const { id, teacherId } = req.params;
      const svc = new AssessmentService();
      const assessment = await svc.getAssessmentByIdInternal(id);
      const owns = !!assessment && assessment.createdBy === teacherId;
      res.json({ owns });
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
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
      .isUUID()
      .withMessage('Invalid assessment ID'),
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