const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/courseController');

// Public: browse courses
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// Admin only: CRUD
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('course_code').trim().notEmpty().withMessage('Course code is required.'),
    body('course_name').trim().notEmpty().withMessage('Course name is required.'),
    body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be 1-6.'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1-8.'),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('course_name').trim().notEmpty().withMessage('Course name is required.'),
    body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be 1-6.'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1-8.'),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', authenticateToken, authorizeRole('admin'), ctrl.remove);

module.exports = router;
