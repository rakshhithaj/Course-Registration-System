const pool = require('../config/db');

// ==================== Admin dashboard stats ====================
exports.getDashboardStats = async (_req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students_master');
    const [[{ totalAccounts }]] = await pool.query('SELECT COUNT(*) AS totalAccounts FROM student_accounts');
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
    const [[{ totalRegistrations }]] = await pool.query(
      `SELECT COUNT(*) AS totalRegistrations FROM registrations r
       JOIN students_master sm ON r.student_id = sm.student_id
       JOIN courses c ON r.course_id = c.id
       WHERE c.department = sm.department AND c.semester = sm.semester`
    );
    const [[{ totalFaculty }]] = await pool.query('SELECT COUNT(*) AS totalFaculty FROM faculty');
    const [[{ invalidRegistrations }]] = await pool.query(
      `SELECT COUNT(*) AS invalidRegistrations FROM registrations r
       JOIN students_master sm ON r.student_id = sm.student_id
       JOIN courses c ON r.course_id = c.id
       WHERE c.department != sm.department OR c.semester != sm.semester`
    );

    const [recentRegistrations] = await pool.query(
      `SELECT r.*, sm.name, c.course_code, c.course_name
       FROM registrations r
       JOIN students_master sm ON r.student_id = sm.student_id
       JOIN courses c ON r.course_id = c.id
       WHERE c.department = sm.department AND c.semester = sm.semester
       ORDER BY r.registered_at DESC LIMIT 10`
    );

    return res.json({
      totalStudents: Number(totalStudents),
      totalAccounts: Number(totalAccounts),
      totalCourses: Number(totalCourses),
      totalRegistrations: Number(totalRegistrations),
      totalFaculty: Number(totalFaculty),
      invalidRegistrations: Number(invalidRegistrations),
      recentRegistrations,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

// ==================== Audit invalid registrations ====================
exports.auditRegistrations = async (_req, res) => {
  try {
    const [invalid] = await pool.query(
      `SELECT r.id AS registration_id, r.student_id, r.registered_at,
              sm.name AS student_name, sm.department AS student_dept, sm.semester AS student_sem,
              c.course_code, c.course_name, c.department AS course_dept, c.semester AS course_sem,
              CASE
                WHEN sm.department != c.department AND sm.semester != c.semester THEN 'DEPT_AND_SEM_MISMATCH'
                WHEN sm.department != c.department THEN 'DEPT_MISMATCH'
                WHEN sm.semester != c.semester THEN 'SEM_MISMATCH'
              END AS violation_type
       FROM registrations r
       JOIN students_master sm ON r.student_id = sm.student_id
       JOIN courses c ON r.course_id = c.id
       WHERE sm.department != c.department OR sm.semester != c.semester
       ORDER BY r.student_id, c.course_code`
    );

    const [[{ totalRegistrations }]] = await pool.query('SELECT COUNT(*) AS totalRegistrations FROM registrations');
    const validCount = Number(totalRegistrations) - invalid.length;

    return res.json({
      totalRegistrations: Number(totalRegistrations),
      validCount,
      invalidCount: invalid.length,
      invalidRegistrations: invalid,
    });
  } catch (err) {
    console.error('Audit error:', err);
    return res.status(500).json({ error: 'Failed to audit registrations.' });
  }
};

// ==================== Cleanup invalid registrations ====================
exports.cleanupRegistrations = async (_req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE r FROM registrations r
       JOIN students_master sm ON r.student_id = sm.student_id
       JOIN courses c ON r.course_id = c.id
       WHERE sm.department != c.department OR sm.semester != c.semester`
    );

    return res.json({
      message: `Cleanup complete. ${result.affectedRows} invalid registration(s) removed.`,
      removedCount: result.affectedRows,
    });
  } catch (err) {
    console.error('Cleanup error:', err);
    return res.status(500).json({ error: 'Failed to cleanup registrations.' });
  }
};
