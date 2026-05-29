const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

// Student Registration
router.post(
  '/register',
  [
    body('student_id').trim().notEmpty().withMessage('Student ID is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
      .matches(/[0-9]/).withMessage('Password must contain a number.'),
  ],
  validate,
  ctrl.register
);

// Student Login
router.post(
  '/login',
  [
    body('student_id').trim().notEmpty().withMessage('Student ID is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  ctrl.login
);

// Admin Login
router.post(
  '/admin/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  ctrl.adminLogin
);

// Change Password (authenticated)
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  ctrl.changePassword
);

// Forgot Password
router.post(
  '/forgot-password',
  [
    body('student_id').trim().notEmpty().withMessage('Student ID is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  ],
  validate,
  ctrl.forgotPassword
);

// Logout
router.post('/logout', authenticateToken, ctrl.logout);

// Get profile
router.get('/profile', authenticateToken, ctrl.getProfile);

module.exports = router;
