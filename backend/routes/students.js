const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/studentController');

// All routes require admin auth
router.use(authenticateToken, authorizeRole('admin'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post(
  '/',
  [
    body('student_id').trim().notEmpty().withMessage('Student ID is required.'),
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1-8.'),
  ],
  validate,
  ctrl.addToMaster
);

router.put(
  '/:id',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1-8.'),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;
