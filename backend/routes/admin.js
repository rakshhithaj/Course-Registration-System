const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(authenticateToken, authorizeRole('admin'));

router.get('/dashboard', ctrl.getDashboardStats);

module.exports = router;
