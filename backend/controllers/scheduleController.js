const pool = require('../config/db');

// ==================== Get schedules for a course ====================
exports.getByCourse = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.course_code, c.course_name
       FROM schedules s
       JOIN courses c ON s.course_id = c.id
       WHERE s.course_id = ?
       ORDER BY FIELD(s.day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), s.start_time`,
      [req.params.courseId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get schedules error:', err);
    return res.status(500).json({ error: 'Failed to fetch schedules.' });
  }
};

// ==================== Get all schedules ====================
exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.course_code, c.course_name
       FROM schedules s
       JOIN courses c ON s.course_id = c.id
       ORDER BY FIELD(s.day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), s.start_time`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get all schedules error:', err);
    return res.status(500).json({ error: 'Failed to fetch schedules.' });
  }
};

// ==================== Create schedule (admin) ====================
exports.create = async (req, res) => {
  const { course_id, day, start_time, end_time, room } = req.body;
  try {
    // Check for room conflict
    const [conflicts] = await pool.query(
      `SELECT s.*, c.course_code FROM schedules s
       JOIN courses c ON s.course_id = c.id
       WHERE s.room = ? AND s.day = ? AND s.start_time < ? AND s.end_time > ?`,
      [room, day, end_time, start_time]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({
        error: `Room ${room} is occupied by ${conflicts[0].course_code} on ${day} (${conflicts[0].start_time}-${conflicts[0].end_time}).`,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO schedules (course_id, day, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)',
      [course_id, day, start_time, end_time, room]
    );
    return res.status(201).json({ message: 'Schedule created.', id: result.insertId });
  } catch (err) {
    console.error('Create schedule error:', err);
    return res.status(500).json({ error: 'Failed to create schedule.' });
  }
};

// ==================== Update schedule (admin) ====================
exports.update = async (req, res) => {
  const { day, start_time, end_time, room } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE schedules SET day = ?, start_time = ?, end_time = ?, room = ? WHERE id = ?',
      [day, start_time, end_time, room, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }
    return res.json({ message: 'Schedule updated.' });
  } catch (err) {
    console.error('Update schedule error:', err);
    return res.status(500).json({ error: 'Failed to update schedule.' });
  }
};

// ==================== Delete schedule (admin) ====================
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }
    return res.json({ message: 'Schedule deleted.' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    return res.status(500).json({ error: 'Failed to delete schedule.' });
  }
};
