const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/facultyController');

router.get('/', authenticateToken, ctrl.getAll);
router.get('/:id', authenticateToken, ctrl.getById);

// Admin only
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('faculty_name').trim().notEmpty().withMessage('Faculty name is required.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('faculty_name').trim().notEmpty().withMessage('Faculty name is required.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', authenticateToken, authorizeRole('admin'), ctrl.remove);

module.exports = router;
