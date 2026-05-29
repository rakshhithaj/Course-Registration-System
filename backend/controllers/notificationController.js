const pool = require('../config/db');

// ==================== Get notifications for current student ====================
exports.getMyNotifications = async (req, res) => {
  const { student_id } = req.user;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC LIMIT 50',
      [student_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

// ==================== Mark notification as read ====================
exports.markRead = async (req, res) => {
  const { student_id } = req.user;
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND student_id = ?',
      [req.params.id, student_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    return res.json({ message: 'Marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
};

// ==================== Mark all as read ====================
exports.markAllRead = async (req, res) => {
  const { student_id } = req.user;
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE student_id = ? AND is_read = FALSE',
      [student_id]
    );
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
};

// ==================== Send notification (admin) ====================
exports.sendNotification = async (req, res) => {
  const { student_id, message } = req.body;
  try {
    if (student_id === 'all') {
      // Broadcast to all students
      const [students] = await pool.query('SELECT student_id FROM students_master');
      const values = students.map((s) => [s.student_id, message]);
      if (values.length > 0) {
        await pool.query(
          'INSERT INTO notifications (student_id, message) VALUES ?',
          [values]
        );
      }
      return res.status(201).json({ message: `Notification sent to ${values.length} students.` });
    }

    await pool.query(
      'INSERT INTO notifications (student_id, message) VALUES (?, ?)',
      [student_id, message]
    );
    return res.status(201).json({ message: 'Notification sent.' });
  } catch (err) {
    console.error('Send notification error:', err);
    return res.status(500).json({ error: 'Failed to send notification.' });
  }
};
