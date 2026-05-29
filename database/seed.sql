-- ============================================================
-- Seed Data for Course Registration System
-- ============================================================

USE course_registration;

-- ============================================================
-- Admin account (password: admin123)
-- ============================================================
INSERT INTO admins (username, password_hash) VALUES
('admin', '$2b$10$B8Nl3cXPsitf45HmEdMwVO4l5EnHClrzbCkx2pyMEvtNSGedVMBQy');

-- ============================================================
-- Faculty
-- ============================================================
INSERT INTO faculty (faculty_name, department, email) VALUES
('Dr. Rajesh Kumar',   'Computer Science', 'rajesh.k@university.edu'),
('Dr. Priya Sharma',   'Computer Science', 'priya.s@university.edu'),
('Dr. Anil Mehta',     'Computer Science', 'anil.m@university.edu'),
('Dr. Sunita Rao',     'Electronics',      'sunita.r@university.edu'),
('Dr. Vikram Singh',   'Electronics',      'vikram.s@university.edu'),
('Dr. Meena Gupta',    'Mathematics',      'meena.g@university.edu'),
('Dr. Amit Patel',     'Mathematics',      'amit.p@university.edu'),
('Dr. Kavita Joshi',   'Physics',          'kavita.j@university.edu');

-- ============================================================
-- Master student records
-- ============================================================
INSERT INTO students_master (student_id, name, department, semester) VALUES
('1RV22CS001', 'Aarav Patel',    'Computer Science', 3),
('1RV22CS002', 'Diya Sharma',    'Computer Science', 3),
('1RV22CS003', 'Vivaan Kumar',   'Computer Science', 5),
('1RV22CS004', 'Ananya Singh',   'Computer Science', 5),
('1RV22CS005', 'Ishaan Reddy',   'Computer Science', 7),
('1RV22EC001', 'Saanvi Joshi',   'Electronics',      3),
('1RV22EC002', 'Arjun Nair',     'Electronics',      5),
('1RV22MA001', 'Kavya Menon',    'Mathematics',      3),
('1RV22PH001', 'Rohan Gupta',    'Physics',          3),
('1RV22CS006', 'Neha Verma',     'Computer Science', 3);

-- ============================================================
-- Courses
-- ============================================================
INSERT INTO courses (course_code, course_name, credits, capacity, department, semester, faculty_id, description) VALUES
('CS101', 'Introduction to Programming',     4, 60, 'Computer Science', 1, 1, 'Fundamentals of programming using C.'),
('CS102', 'Data Structures',                  4, 60, 'Computer Science', 2, 1, 'Arrays, linked lists, trees, graphs.'),
('CS201', 'Object Oriented Programming',      4, 60, 'Computer Science', 3, 2, 'OOP concepts with Java.'),
('CS202', 'Database Management Systems',      4, 60, 'Computer Science', 3, 3, 'Relational databases, SQL, normalization.'),
('CS203', 'Computer Networks',                3, 50, 'Computer Science', 3, 2, 'OSI model, TCP/IP, routing.'),
('CS301', 'Operating Systems',                4, 50, 'Computer Science', 5, 1, 'Process management, memory, file systems.'),
('CS302', 'Software Engineering',             3, 50, 'Computer Science', 5, 3, 'SDLC, agile, design patterns.'),
('CS303', 'Machine Learning',                 4, 40, 'Computer Science', 5, 2, 'Supervised and unsupervised learning.'),
('CS401', 'Compiler Design',                  4, 40, 'Computer Science', 7, 3, 'Lexical analysis, parsing, code generation.'),
('CS402', 'Cloud Computing',                  3, 40, 'Computer Science', 7, 1, 'Virtualization, AWS, microservices.'),
('EC101', 'Basic Electronics',                4, 60, 'Electronics',      1, 4, 'Circuit theory, diodes, transistors.'),
('EC201', 'Digital Electronics',              4, 50, 'Electronics',      3, 4, 'Boolean algebra, combinational circuits.'),
('EC301', 'Microprocessors',                  4, 50, 'Electronics',      5, 5, '8086, ARM architecture.'),
('MA101', 'Engineering Mathematics I',        4, 80, 'Mathematics',      1, 6, 'Calculus, linear algebra.'),
('MA201', 'Probability and Statistics',       3, 60, 'Mathematics',      3, 7, 'Random variables, distributions, hypothesis testing.'),
('PH101', 'Engineering Physics',              3, 80, 'Physics',          1, 8, 'Mechanics, waves, optics.');

-- ============================================================
-- Prerequisites
-- ============================================================
INSERT INTO prerequisites (course_id, prerequisite_id) VALUES
((SELECT id FROM courses WHERE course_code='CS102'), (SELECT id FROM courses WHERE course_code='CS101')),
((SELECT id FROM courses WHERE course_code='CS201'), (SELECT id FROM courses WHERE course_code='CS101')),
((SELECT id FROM courses WHERE course_code='CS301'), (SELECT id FROM courses WHERE course_code='CS201')),
((SELECT id FROM courses WHERE course_code='CS301'), (SELECT id FROM courses WHERE course_code='CS102')),
((SELECT id FROM courses WHERE course_code='CS303'), (SELECT id FROM courses WHERE course_code='CS201')),
((SELECT id FROM courses WHERE course_code='CS401'), (SELECT id FROM courses WHERE course_code='CS301')),
((SELECT id FROM courses WHERE course_code='EC201'), (SELECT id FROM courses WHERE course_code='EC101')),
((SELECT id FROM courses WHERE course_code='EC301'), (SELECT id FROM courses WHERE course_code='EC201'));

-- ============================================================
-- Schedules
-- ============================================================
INSERT INTO schedules (course_id, day, start_time, end_time, room) VALUES
((SELECT id FROM courses WHERE course_code='CS201'), 'Monday',    '09:00', '10:00', 'CS-101'),
((SELECT id FROM courses WHERE course_code='CS201'), 'Wednesday', '09:00', '10:00', 'CS-101'),
((SELECT id FROM courses WHERE course_code='CS201'), 'Friday',    '09:00', '10:00', 'CS-101'),
((SELECT id FROM courses WHERE course_code='CS202'), 'Monday',    '10:00', '11:00', 'CS-102'),
((SELECT id FROM courses WHERE course_code='CS202'), 'Wednesday', '10:00', '11:00', 'CS-102'),
((SELECT id FROM courses WHERE course_code='CS202'), 'Friday',    '10:00', '11:00', 'CS-102'),
((SELECT id FROM courses WHERE course_code='CS203'), 'Tuesday',   '09:00', '10:00', 'CS-103'),
((SELECT id FROM courses WHERE course_code='CS203'), 'Thursday',  '09:00', '10:00', 'CS-103'),
((SELECT id FROM courses WHERE course_code='CS301'), 'Monday',    '11:00', '12:00', 'CS-201'),
((SELECT id FROM courses WHERE course_code='CS301'), 'Wednesday', '11:00', '12:00', 'CS-201'),
((SELECT id FROM courses WHERE course_code='CS301'), 'Friday',    '11:00', '12:00', 'CS-201'),
((SELECT id FROM courses WHERE course_code='CS302'), 'Tuesday',   '10:00', '11:00', 'CS-202'),
((SELECT id FROM courses WHERE course_code='CS302'), 'Thursday',  '10:00', '11:00', 'CS-202'),
((SELECT id FROM courses WHERE course_code='CS303'), 'Monday',    '14:00', '15:00', 'CS-LAB1'),
((SELECT id FROM courses WHERE course_code='CS303'), 'Wednesday', '14:00', '15:00', 'CS-LAB1'),
((SELECT id FROM courses WHERE course_code='CS303'), 'Friday',    '14:00', '15:00', 'CS-LAB1'),
((SELECT id FROM courses WHERE course_code='CS401'), 'Tuesday',   '11:00', '12:00', 'CS-301'),
((SELECT id FROM courses WHERE course_code='CS401'), 'Thursday',  '11:00', '12:00', 'CS-301'),
((SELECT id FROM courses WHERE course_code='CS402'), 'Tuesday',   '14:00', '15:00', 'CS-302'),
((SELECT id FROM courses WHERE course_code='CS402'), 'Thursday',  '14:00', '15:00', 'CS-302'),
((SELECT id FROM courses WHERE course_code='EC201'), 'Monday',    '09:00', '10:00', 'EC-101'),
((SELECT id FROM courses WHERE course_code='EC201'), 'Wednesday', '09:00', '10:00', 'EC-101'),
((SELECT id FROM courses WHERE course_code='MA201'), 'Tuesday',   '09:00', '10:00', 'MA-101'),
((SELECT id FROM courses WHERE course_code='MA201'), 'Thursday',  '09:00', '10:00', 'MA-101');

-- ============================================================
-- Completed courses (for prerequisite validation testing)
-- ============================================================
INSERT INTO completed_courses (student_id, course_id, grade, completed_at) VALUES
('1RV22CS001', (SELECT id FROM courses WHERE course_code='CS101'), 'A', '2023-05-15'),
('1RV22CS001', (SELECT id FROM courses WHERE course_code='CS102'), 'B+', '2023-05-15'),
('1RV22CS002', (SELECT id FROM courses WHERE course_code='CS101'), 'A+', '2023-05-15'),
('1RV22CS002', (SELECT id FROM courses WHERE course_code='CS102'), 'A', '2023-05-15'),
('1RV22CS003', (SELECT id FROM courses WHERE course_code='CS101'), 'B', '2022-05-15'),
('1RV22CS003', (SELECT id FROM courses WHERE course_code='CS102'), 'B+', '2022-05-15'),
('1RV22CS003', (SELECT id FROM courses WHERE course_code='CS201'), 'A', '2023-05-15'),
('1RV22CS003', (SELECT id FROM courses WHERE course_code='CS202'), 'A', '2023-05-15'),
('1RV22CS004', (SELECT id FROM courses WHERE course_code='CS101'), 'A', '2022-05-15'),
('1RV22CS004', (SELECT id FROM courses WHERE course_code='CS102'), 'A+', '2022-05-15'),
('1RV22CS004', (SELECT id FROM courses WHERE course_code='CS201'), 'B+', '2023-05-15'),
('1RV22CS005', (SELECT id FROM courses WHERE course_code='CS101'), 'A', '2021-05-15'),
('1RV22CS005', (SELECT id FROM courses WHERE course_code='CS102'), 'A', '2021-05-15'),
('1RV22CS005', (SELECT id FROM courses WHERE course_code='CS201'), 'A+', '2022-05-15'),
('1RV22CS005', (SELECT id FROM courses WHERE course_code='CS301'), 'A', '2023-05-15'),
('1RV22EC001', (SELECT id FROM courses WHERE course_code='EC101'), 'B+', '2023-05-15');

-- ============================================================
-- Sample notifications
-- ============================================================
INSERT INTO notifications (student_id, message) VALUES
('1RV22CS001', 'Welcome to the Course Registration System! Registration is now open for Semester 3.'),
('1RV22CS002', 'Welcome to the Course Registration System! Registration is now open for Semester 3.'),
('1RV22CS003', 'Registration deadline for Semester 5 is December 15, 2025.');
