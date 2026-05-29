const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.use(authenticateToken, authorizeRole('admin'));

router.get('/students', ctrl.studentReport);
router.get('/courses', ctrl.courseReport);
router.get('/departments', ctrl.departmentReport);

module.exports = router;
