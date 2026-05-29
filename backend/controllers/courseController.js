const pool = require('../config/db');

// ==================== Get all courses ====================
exports.getAll = async (req, res) => {
  try {
    const { department, semester, credits, search } = req.query;
    let sql = `
      SELECT c.*, f.faculty_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.course_id = c.id) AS enrolled
      FROM courses c
      LEFT JOIN faculty f ON c.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      sql += ' AND c.department = ?';
      params.push(department);
    }
    if (semester) {
      sql += ' AND c.semester = ?';
      params.push(parseInt(semester, 10));
    }
    if (credits) {
      sql += ' AND c.credits = ?';
      params.push(parseInt(credits, 10));
    }
    if (search) {
      sql += ' AND (c.course_code LIKE ? OR c.course_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY c.course_code';

    const [rows] = await pool.query(sql, params);

    const courses = rows.map((c) => ({
      ...c,
      enrolled: Number(c.enrolled),
      available_seats: c.capacity - Number(c.enrolled),
    }));

    return res.json(courses);
  } catch (err) {
    console.error('Get courses error:', err);
    return res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// ==================== Get course by ID ====================
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, f.faculty_name,
              (SELECT COUNT(*) FROM registrations r WHERE r.course_id = c.id) AS enrolled
       FROM courses c
       LEFT JOIN faculty f ON c.faculty_id = f.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const course = rows[0];
    course.enrolled = Number(course.enrolled);
    course.available_seats = course.capacity - course.enrolled;

    // Get prerequisites
    const [prereqs] = await pool.query(
      `SELECT c.course_code, c.course_name
       FROM prerequisites p
       JOIN courses c ON p.prerequisite_id = c.id
       WHERE p.course_id = ?`,
      [req.params.id]
    );
    course.prerequisites = prereqs;

    // Get schedule
    const [schedules] = await pool.query(
      'SELECT day, start_time, end_time, room FROM schedules WHERE course_id = ?',
      [req.params.id]
    );
    course.schedule = schedules;

    return res.json(course);
  } catch (err) {
    console.error('Get course error:', err);
    return res.status(500).json({ error: 'Failed to fetch course.' });
  }
};

// ==================== Create course (admin) ====================
exports.create = async (req, res) => {
  const { course_code, course_name, credits, capacity, department, semester, faculty_id, description } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO courses (course_code, course_name, credits, capacity, department, semester, faculty_id, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_code, course_name, credits, capacity, department, semester, faculty_id || null, description || null]
    );
    return res.status(201).json({ message: 'Course created.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Course code already exists.' });
    }
    console.error('Create course error:', err);
    return res.status(500).json({ error: 'Failed to create course.' });
  }
};

// ==================== Update course (admin) ====================
exports.update = async (req, res) => {
  const { course_name, credits, capacity, department, semester, faculty_id, description } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE courses SET course_name = ?, credits = ?, capacity = ?, department = ?,
       semester = ?, faculty_id = ?, description = ? WHERE id = ?`,
      [course_name, credits, capacity, department, semester, faculty_id || null, description || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    return res.json({ message: 'Course updated.' });
  } catch (err) {
    console.error('Update course error:', err);
    return res.status(500).json({ error: 'Failed to update course.' });
  }
};

// ==================== Delete course (admin) ====================
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    return res.json({ message: 'Course deleted.' });
  } catch (err) {
    console.error('Delete course error:', err);
    return res.status(500).json({ error: 'Failed to delete course.' });
  }
};
