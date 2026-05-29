const pool = require('../config/db');

const MAX_CREDITS = 24;

// ==================== Register for a course ====================
exports.register = async (req, res) => {
  const { course_id } = req.body;
  const { student_id } = req.user;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    console.log(`[Registration] Student ${student_id} attempting to register for course ${course_id}`);

    // 1. Check duplicate registration
    const [dup] = await conn.query(
      'SELECT id FROM registrations WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    if (dup.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'You are already registered for this course.' });
    }

    // 2. Get course details and enrollment count
    const [courseRows] = await conn.query(
      `SELECT c.*, (SELECT COUNT(*) FROM registrations r WHERE r.course_id = c.id) AS enrolled
       FROM courses c WHERE c.id = ?`,
      [course_id]
    );
    if (courseRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Course not found.' });
    }
    const course = courseRows[0];
    course.enrolled = Number(course.enrolled);

    // 3. Department & semester restriction
    const [studentRows] = await conn.query(
      'SELECT department, semester FROM students_master WHERE student_id = ?',
      [student_id]
    );
    if (studentRows.length > 0) {
      const student = studentRows[0];
      if (course.department !== student.department) {
        await conn.rollback();
        return res.status(400).json({
          error: `Course not available for your department. Your department: ${student.department}, Course department: ${course.department}.`,
        });
      }
      if (course.semester !== student.semester) {
        await conn.rollback();
        return res.status(400).json({
          error: `You can only register for courses in your semester (Semester ${student.semester}).`,
        });
      }
    }

    // 4. Seat availability
    if (course.enrolled >= course.capacity) {
      await conn.rollback();

      // Notify student
      await pool.query(
        'INSERT INTO notifications (student_id, message) VALUES (?, ?)',
        [student_id, `Course ${course.course_code} - ${course.course_name} is full.`]
      );

      return res.status(409).json({ error: 'Course is full. No seats available.' });
    }

    // 5. Prerequisite check
    const [prereqs] = await conn.query(
      'SELECT prerequisite_id FROM prerequisites WHERE course_id = ?',
      [course_id]
    );
    if (prereqs.length > 0) {
      const prereqIds = prereqs.map((p) => p.prerequisite_id);
      const [completed] = await conn.query(
        'SELECT course_id FROM completed_courses WHERE student_id = ? AND course_id IN (?)',
        [student_id, prereqIds]
      );
      const completedIds = new Set(completed.map((c) => c.course_id));
      const missing = prereqIds.filter((id) => !completedIds.has(id));

      if (missing.length > 0) {
        const [missingCourses] = await conn.query(
          'SELECT course_code, course_name FROM courses WHERE id IN (?)',
          [missing]
        );
        await conn.rollback();
        return res.status(400).json({
          error: 'Prerequisites not met.',
          missing: missingCourses.map((c) => `${c.course_code} - ${c.course_name}`),
        });
      }
    }

    // 6. Credit limit check
    const [creditRows] = await conn.query(
      `SELECT COALESCE(SUM(c.credits), 0) AS total_credits
       FROM registrations r
       JOIN courses c ON r.course_id = c.id
       WHERE r.student_id = ?`,
      [student_id]
    );
    const currentCredits = Number(creditRows[0].total_credits);
    console.log(`[Registration] Credit check: current=${currentCredits}, adding=${course.credits}, max=${MAX_CREDITS}, total=${currentCredits + course.credits}`);
    if (currentCredits + course.credits > MAX_CREDITS) {
      await conn.rollback();
      return res.status(400).json({
        error: `Credit limit exceeded. Current: ${currentCredits}, Adding: ${course.credits}, Max: ${MAX_CREDITS}.`,
      });
    }

    // 7. Schedule conflict check
    const [newSchedules] = await conn.query(
      'SELECT day, start_time, end_time FROM schedules WHERE course_id = ?',
      [course_id]
    );

    if (newSchedules.length > 0) {
      const [existingSchedules] = await conn.query(
        `SELECT s.day, s.start_time, s.end_time, c.course_code
         FROM registrations r
         JOIN schedules s ON r.course_id = s.course_id
         JOIN courses c ON r.course_id = c.id
         WHERE r.student_id = ?`,
        [student_id]
      );

      for (const ns of newSchedules) {
        for (const es of existingSchedules) {
          if (
            ns.day === es.day &&
            ns.start_time < es.end_time &&
            ns.end_time > es.start_time
          ) {
            await conn.rollback();
            return res.status(409).json({
              error: `Schedule conflict with ${es.course_code} on ${es.day} (${es.start_time}-${es.end_time}).`,
            });
          }
        }
      }
    }

    // 8. All checks passed — register
    await conn.query(
      'INSERT INTO registrations (student_id, course_id) VALUES (?, ?)',
      [student_id, course_id]
    );

    // 9. Send notification
    await conn.query(
      'INSERT INTO notifications (student_id, message) VALUES (?, ?)',
      [student_id, `Successfully registered for ${course.course_code} - ${course.course_name}.`]
    );

    await conn.commit();
    return res.status(201).json({ message: `Registered for ${course.course_code} - ${course.course_name}.` });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You are already registered for this course.' });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed.' });
  } finally {
    conn.release();
  }
};

// ==================== Drop a course ====================
exports.drop = async (req, res) => {
  const { course_id } = req.body;
  const { student_id } = req.user;

  try {
    const [result] = await pool.query(
      'DELETE FROM registrations WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    // Get course info for notification
    const [courseRows] = await pool.query(
      'SELECT course_code, course_name FROM courses WHERE id = ?',
      [course_id]
    );
    const courseName = courseRows.length > 0
      ? `${courseRows[0].course_code} - ${courseRows[0].course_name}`
      : `Course #${course_id}`;

    await pool.query(
      'INSERT INTO notifications (student_id, message) VALUES (?, ?)',
      [student_id, `Dropped ${courseName}.`]
    );

    return res.json({ message: `Dropped ${courseName}.` });
  } catch (err) {
    console.error('Drop course error:', err);
    return res.status(500).json({ error: 'Failed to drop course.' });
  }
};

// ==================== Get my registered courses ====================
exports.getMyCourses = async (req, res) => {
  const { student_id } = req.user;
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.course_code, c.course_name, c.credits, c.department,
              c.semester, f.faculty_name, r.registered_at
       FROM registrations r
       JOIN courses c ON r.course_id = c.id
       JOIN students_master sm ON r.student_id = sm.student_id
       LEFT JOIN faculty f ON c.faculty_id = f.id
       WHERE r.student_id = ?
         AND c.department = sm.department
         AND c.semester = sm.semester
       ORDER BY r.registered_at DESC`,
      [student_id]
    );

    // Calculate total credits
    const totalCredits = rows.reduce((sum, c) => sum + c.credits, 0);

    return res.json({
      courses: rows,
      totalCredits,
      availableCredits: MAX_CREDITS - totalCredits,
    });
  } catch (err) {
    console.error('Get my courses error:', err);
    return res.status(500).json({ error: 'Failed to fetch registered courses.' });
  }
};
