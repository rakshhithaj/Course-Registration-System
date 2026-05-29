const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/registrationController');

// All routes require student auth
router.use(authenticateToken, authorizeRole('student'));

router.post(
  '/register',
  [body('course_id').isInt({ min: 1 }).withMessage('Valid course ID is required.')],
  validate,
  ctrl.register
);

router.delete(
  '/drop',
  [body('course_id').isInt({ min: 1 }).withMessage('Valid course ID is required.')],
  validate,
  ctrl.drop
);

router.get('/my-courses', ctrl.getMyCourses);

module.exports = router;
