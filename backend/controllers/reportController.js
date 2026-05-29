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
              AND c.department = sm.department
              AND c.semester = sm.semester
       GROUP BY sm.student_id, sm.name, sm.department, sm.semester
       ORDER BY sm.student_id`
    );
    const parsed = rows.map((r) => ({
      ...r,
      course_count: Number(r.course_count),
      total_credits: Number(r.total_credits),
    }));
    return res.json(parsed);
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
    const parsed = rows.map((r) => ({
      ...r,
      enrolled: Number(r.enrolled),
      available_seats: Number(r.available_seats),
    }));
    return res.json(parsed);
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
    const parsed = rows.map((r) => ({
      ...r,
      total_students: Number(r.total_students),
      total_courses: Number(r.total_courses),
      total_registrations: Number(r.total_registrations),
    }));
    return res.json(parsed);
  } catch (err) {
    console.error('Department report error:', err);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
};
