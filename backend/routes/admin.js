const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(authenticateToken, authorizeRole('admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/audit-registrations', ctrl.auditRegistrations);
router.delete('/cleanup-registrations', ctrl.cleanupRegistrations);

module.exports = router;
