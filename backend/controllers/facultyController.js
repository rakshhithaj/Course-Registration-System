const pool = require('../config/db');

// ==================== Get all faculty ====================
exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty ORDER BY faculty_name');
    return res.json(rows);
  } catch (err) {
    console.error('Get faculty error:', err);
    return res.status(500).json({ error: 'Failed to fetch faculty.' });
  }
};

// ==================== Get faculty by ID ====================
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Faculty not found.' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Get faculty error:', err);
    return res.status(500).json({ error: 'Failed to fetch faculty.' });
  }
};

// ==================== Create faculty (admin) ====================
exports.create = async (req, res) => {
  const { faculty_name, department, email } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO faculty (faculty_name, department, email) VALUES (?, ?, ?)',
      [faculty_name, department, email || null]
    );
    return res.status(201).json({ message: 'Faculty created.', id: result.insertId });
  } catch (err) {
    console.error('Create faculty error:', err);
    return res.status(500).json({ error: 'Failed to create faculty.' });
  }
};

// ==================== Update faculty (admin) ====================
exports.update = async (req, res) => {
  const { faculty_name, department, email } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE faculty SET faculty_name = ?, department = ?, email = ? WHERE id = ?',
      [faculty_name, department, email || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Faculty not found.' });
    }
    return res.json({ message: 'Faculty updated.' });
  } catch (err) {
    console.error('Update faculty error:', err);
    return res.status(500).json({ error: 'Failed to update faculty.' });
  }
};

// ==================== Delete faculty (admin) ====================
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM faculty WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Faculty not found.' });
    }
    return res.json({ message: 'Faculty deleted.' });
  } catch (err) {
    console.error('Delete faculty error:', err);
    return res.status(500).json({ error: 'Failed to delete faculty.' });
  }
};
