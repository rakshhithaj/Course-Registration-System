const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/scheduleController');

router.get('/', authenticateToken, ctrl.getAll);
router.get('/course/:courseId', authenticateToken, ctrl.getByCourse);

// Admin only
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('course_id').isInt({ min: 1 }).withMessage('Valid course ID is required.'),
    body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
      .withMessage('Valid day is required.'),
    body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('Start time format: HH:MM'),
    body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('End time format: HH:MM'),
    body('room').trim().notEmpty().withMessage('Room is required.'),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
      .withMessage('Valid day is required.'),
    body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('Start time format: HH:MM'),
    body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('End time format: HH:MM'),
    body('room').trim().notEmpty().withMessage('Room is required.'),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', authenticateToken, authorizeRole('admin'), ctrl.remove);

module.exports = router;
