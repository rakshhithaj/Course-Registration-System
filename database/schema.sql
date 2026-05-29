-- ============================================================
-- Course Registration System - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS course_registration;
USE course_registration;

-- ============================================================
-- 1. Master student records (populated by administration)
-- ============================================================
CREATE TABLE students_master (
    student_id   VARCHAR(20)  NOT NULL,
    name         VARCHAR(100) NOT NULL,
    department   VARCHAR(50)  NOT NULL,
    semester     TINYINT UNSIGNED NOT NULL CHECK (semester BETWEEN 1 AND 8),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Student accounts (one-to-one with master)
-- ============================================================
CREATE TABLE student_accounts (
    id            INT UNSIGNED AUTO_INCREMENT,
    student_id    VARCHAR(20)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    phone         VARCHAR(15)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_id (student_id),
    UNIQUE KEY uq_email (email),
    CONSTRAINT fk_account_master FOREIGN KEY (student_id)
        REFERENCES students_master(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Admin accounts
-- ============================================================
CREATE TABLE admins (
    id            INT UNSIGNED AUTO_INCREMENT,
    username      VARCHAR(50)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Faculty
-- ============================================================
CREATE TABLE faculty (
    id            INT UNSIGNED AUTO_INCREMENT,
    faculty_name  VARCHAR(100) NOT NULL,
    department    VARCHAR(50)  NOT NULL,
    email         VARCHAR(100),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Courses
-- ============================================================
CREATE TABLE courses (
    id            INT UNSIGNED AUTO_INCREMENT,
    course_code   VARCHAR(20)  NOT NULL,
    course_name   VARCHAR(150) NOT NULL,
    credits       TINYINT UNSIGNED NOT NULL CHECK (credits BETWEEN 1 AND 6),
    capacity      SMALLINT UNSIGNED NOT NULL DEFAULT 60,
    department    VARCHAR(50)  NOT NULL,
    semester      TINYINT UNSIGNED NOT NULL CHECK (semester BETWEEN 1 AND 8),
    faculty_id    INT UNSIGNED,
    description   TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_course_code (course_code),
    CONSTRAINT fk_course_faculty FOREIGN KEY (faculty_id)
        REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Course prerequisites
-- ============================================================
CREATE TABLE prerequisites (
    course_id         INT UNSIGNED NOT NULL,
    prerequisite_id   INT UNSIGNED NOT NULL,
    PRIMARY KEY (course_id, prerequisite_id),
    CONSTRAINT fk_prereq_course FOREIGN KEY (course_id)
        REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_prereq_required FOREIGN KEY (prerequisite_id)
        REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Schedules / Timetable
-- ============================================================
CREATE TABLE schedules (
    id         INT UNSIGNED AUTO_INCREMENT,
    course_id  INT UNSIGNED NOT NULL,
    day        ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    room       VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_schedule_course FOREIGN KEY (course_id)
        REFERENCES courses(id) ON DELETE CASCADE,
    CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Registrations (student ↔ course)
-- ============================================================
CREATE TABLE registrations (
    id            INT UNSIGNED AUTO_INCREMENT,
    student_id    VARCHAR(20)  NOT NULL,
    course_id     INT UNSIGNED NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_course (student_id, course_id),
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id)
        REFERENCES students_master(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_course FOREIGN KEY (course_id)
        REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. Completed courses (for prerequisite checking)
-- ============================================================
CREATE TABLE completed_courses (
    student_id  VARCHAR(20)  NOT NULL,
    course_id   INT UNSIGNED NOT NULL,
    grade       VARCHAR(2),
    completed_at DATE,
    PRIMARY KEY (student_id, course_id),
    CONSTRAINT fk_completed_student FOREIGN KEY (student_id)
        REFERENCES students_master(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_completed_course FOREIGN KEY (course_id)
        REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. Notifications
-- ============================================================
CREATE TABLE notifications (
    id          INT UNSIGNED AUTO_INCREMENT,
    student_id  VARCHAR(20) NOT NULL,
    message     VARCHAR(500) NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_student FOREIGN KEY (student_id)
        REFERENCES students_master(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Indexes for query performance
-- ============================================================
CREATE INDEX idx_reg_student    ON registrations(student_id);
CREATE INDEX idx_reg_course     ON registrations(course_id);
CREATE INDEX idx_schedule_course ON schedules(course_id);
CREATE INDEX idx_notif_student  ON notifications(student_id);
CREATE INDEX idx_course_dept    ON courses(department);
CREATE INDEX idx_course_sem     ON courses(semester);
CREATE INDEX idx_completed_student ON completed_courses(student_id);
