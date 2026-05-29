const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

// ==================== Student Registration ====================
exports.register = async (req, res) => {
  const { student_id, email, phone, password } = req.body;

  const conn = await pool.getConnection();
  try {
    // 1. Verify student exists in master records
    const [master] = await conn.query(
      'SELECT * FROM students_master WHERE student_id = ?',
      [student_id]
    );
    if (master.length === 0) {
      return res.status(400).json({ error: 'Student ID not found in master records. Contact administration.' });
    }

    // 2. Check if account already exists for this student_id
    const [existing] = await conn.query(
      'SELECT id FROM student_accounts WHERE student_id = ?',
      [student_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account already exists for this Student ID.' });
    }

    // 3. Check if email is already used
    const [emailCheck] = await conn.query(
      'SELECT id FROM student_accounts WHERE email = ?',
      [email]
    );
    if (emailCheck.length > 0) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    // 4. Hash password and create account
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await conn.query(
      'INSERT INTO student_accounts (student_id, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [student_id, email, phone, passwordHash]
    );

    return res.status(201).json({ message: 'Account created successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed.' });
  } finally {
    conn.release();
  }
};

// ==================== Student Login ====================
exports.login = async (req, res) => {
  const { student_id, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT sa.*, sm.name, sm.department, sm.semester
       FROM student_accounts sa
       JOIN students_master sm ON sa.student_id = sm.student_id
       WHERE sa.student_id = ?`,
      [student_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Student ID or password.' });
    }

    const account = rows[0];
    const valid = await bcrypt.compare(password, account.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid Student ID or password.' });
    }

    const token = jwt.sign(
      { id: account.id, student_id: account.student_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.json({
      token,
      user: {
        student_id: account.student_id,
        name: account.name,
        email: account.email,
        department: account.department,
        semester: account.semester,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
};

// ==================== Admin Login ====================
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.json({
      token,
      user: { id: admin.id, username: admin.username, role: 'admin' },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
};

// ==================== Change Password ====================
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { student_id } = req.user;

  try {
    const [rows] = await pool.query(
      'SELECT password_hash FROM student_accounts WHERE student_id = ?',
      [student_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query(
      'UPDATE student_accounts SET password_hash = ? WHERE student_id = ?',
      [hash, student_id]
    );

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to change password.' });
  }
};

// ==================== Forgot Password ====================
exports.forgotPassword = async (req, res) => {
  const { student_id, email } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id FROM student_accounts WHERE student_id = ? AND email = ?',
      [student_id, email]
    );
    if (rows.length === 0) {
      // Don't reveal whether account exists
      return res.json({ message: 'If the account exists, a reset link has been sent.' });
    }

    // In production, generate a reset token and send via email
    const resetToken = jwt.sign(
      { id: rows[0].id, student_id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // For now, return the token (in production, email it)
    return res.json({
      message: 'If the account exists, a reset link has been sent.',
      // Remove resetToken in production — only for dev/testing
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Request failed.' });
  }
};

// ==================== Logout (client-side token removal) ====================
exports.logout = async (_req, res) => {
  // JWT is stateless — client removes the token.
  // For enhanced security, implement a token blacklist with Redis.
  return res.json({ message: 'Logged out successfully.' });
};

// ==================== Get current user profile ====================
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sa.student_id, sa.email, sa.phone, sm.name, sm.department, sm.semester
       FROM student_accounts sa
       JOIN students_master sm ON sa.student_id = sm.student_id
       WHERE sa.student_id = ?`,
      [req.user.student_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
};
