const pool = require('../config/db');

// ==================== Student Enrollment Report ====================
exports.studentReport = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sm.student_id, sm.name, sm.department, sm.semester,
              GROUP_CONCAT(c.course_code ORDER BY c.course_code SEPARATOR ', ') AS courses,
              COUNT(r.id) AS course_count,
              COALESCE(SUM(c.credits), 0) AS total_credits
       FROM students_master sm
       LEFT JOIN registrations r ON sm.student_id = r.student_id
       LEFT JOIN courses c ON r.course_id = c.id
       GROUP BY sm.student_id, sm.name, sm.department, sm.semester
       ORDER BY sm.student_id`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Student report error:', err);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
};

// ==================== Course Report ====================
exports.courseReport = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.course_code, c.course_name, c.department, c.credits,
              c.capacity, f.faculty_name,
              COUNT(r.id) AS enrolled,
              (c.capacity - COUNT(r.id)) AS available_seats
       FROM courses c
       LEFT JOIN faculty f ON c.faculty_id = f.id
       LEFT JOIN registrations r ON c.id = r.course_id
       GROUP BY c.id, c.course_code, c.course_name, c.department,
                c.credits, c.capacity, f.faculty_name
       ORDER BY c.course_code`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Course report error:', err);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
};

// ==================== Department Report ====================
exports.departmentReport = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         d.department,
         (SELECT COUNT(*) FROM students_master sm WHERE sm.department = d.department) AS total_students,
         COUNT(DISTINCT d.id) AS total_courses,
         (SELECT COUNT(*) FROM registrations reg
          JOIN courses cc ON reg.course_id = cc.id
          WHERE cc.department = d.department) AS total_registrations
       FROM courses d
       GROUP BY d.department
       ORDER BY d.department`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Department report error:', err);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
};
