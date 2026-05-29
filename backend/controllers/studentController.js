const pool = require('../config/db');

// ==================== Get all students ====================
exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sm.student_id, sm.name, sm.department, sm.semester,
              sa.email, sa.phone, sa.created_at
       FROM students_master sm
       LEFT JOIN student_accounts sa ON sm.student_id = sa.student_id
       ORDER BY sm.student_id`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get students error:', err);
    return res.status(500).json({ error: 'Failed to fetch students.' });
  }
};

// ==================== Get student by ID ====================
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sm.student_id, sm.name, sm.department, sm.semester,
              sa.email, sa.phone, sa.created_at
       FROM students_master sm
       LEFT JOIN student_accounts sa ON sm.student_id = sa.student_id
       WHERE sm.student_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Get student error:', err);
    return res.status(500).json({ error: 'Failed to fetch student.' });
  }
};

// ==================== Update student (admin) ====================
exports.update = async (req, res) => {
  const { name, department, semester } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE students_master SET name = ?, department = ?, semester = ? WHERE student_id = ?',
      [name, department, semester, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    return res.json({ message: 'Student updated.' });
  } catch (err) {
    console.error('Update student error:', err);
    return res.status(500).json({ error: 'Failed to update student.' });
  }
};

// ==================== Delete student (admin) ====================
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM students_master WHERE student_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    return res.json({ message: 'Student deleted.' });
  } catch (err) {
    console.error('Delete student error:', err);
    return res.status(500).json({ error: 'Failed to delete student.' });
  }
};

// ==================== Add student to master (admin) ====================
exports.addToMaster = async (req, res) => {
  const { student_id, name, department, semester } = req.body;
  try {
    await pool.query(
      'INSERT INTO students_master (student_id, name, department, semester) VALUES (?, ?, ?, ?)',
      [student_id, name, department, semester]
    );
    return res.status(201).json({ message: 'Student added to master records.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists.' });
    }
    console.error('Add student error:', err);
    return res.status(500).json({ error: 'Failed to add student.' });
  }
};
