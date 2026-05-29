const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

// Student routes
router.get('/', authenticateToken, authorizeRole('student'), ctrl.getMyNotifications);
router.put('/:id/read', authenticateToken, authorizeRole('student'), ctrl.markRead);
router.put('/read-all', authenticateToken, authorizeRole('student'), ctrl.markAllRead);

// Admin: send notification
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  [
    body('student_id').trim().notEmpty().withMessage('Student ID or "all" is required.'),
    body('message').trim().notEmpty().withMessage('Message is required.'),
  ],
  validate,
  ctrl.sendNotification
);

module.exports = router;
