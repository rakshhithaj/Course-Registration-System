const pool = require('../config/db');

// ==================== Admin dashboard stats ====================
exports.getDashboardStats = async (_req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students_master');
    const [[{ totalAccounts }]] = await pool.query('SELECT COUNT(*) AS totalAccounts FROM student_accounts');
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
    const [[{ totalRegistrations }]] = await pool.query('SELECT COUNT(*) AS totalRegistrations FROM registrations');
    const [[{ totalFaculty }]] = await pool.query('SELECT COUNT(*) AS totalFaculty FROM faculty');

    const [recentRegistrations] = await pool.query(
      `SELECT r.*, sm.name, c.course_code, c.course_name
       FROM registrations r
       JOIN students_master sm ON r.student_id = sm.student_id
       JOIN courses c ON r.course_id = c.id
       ORDER BY r.registered_at DESC LIMIT 10`
    );

    return res.json({
      totalStudents,
      totalAccounts,
      totalCourses,
      totalRegistrations,
      totalFaculty,
      recentRegistrations,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};
