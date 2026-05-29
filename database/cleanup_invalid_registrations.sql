-- ============================================================
-- Cleanup Script: Remove Invalid Legacy Registrations
-- ============================================================
-- This script identifies and removes registrations that violate
-- current business rules:
--   1. Course semester != Student semester
--   2. Course department != Student department
-- ============================================================

USE course_registration;

-- ============================================================
-- Step 1: AUDIT — View all invalid registrations (dry run)
-- ============================================================
SELECT
    r.id AS registration_id,
    r.student_id,
    sm.name AS student_name,
    sm.department AS student_dept,
    sm.semester AS student_sem,
    c.course_code,
    c.course_name,
    c.department AS course_dept,
    c.semester AS course_sem,
    r.registered_at,
    CASE
        WHEN sm.department != c.department AND sm.semester != c.semester
            THEN 'DEPT_AND_SEM_MISMATCH'
        WHEN sm.department != c.department
            THEN 'DEPT_MISMATCH'
        WHEN sm.semester != c.semester
            THEN 'SEM_MISMATCH'
    END AS violation_type
FROM registrations r
JOIN students_master sm ON r.student_id = sm.student_id
JOIN courses c ON r.course_id = c.id
WHERE sm.department != c.department
   OR sm.semester != c.semester
ORDER BY r.student_id, c.course_code;

-- ============================================================
-- Step 2: COUNT invalid registrations
-- ============================================================
SELECT
    COUNT(*) AS total_invalid,
    SUM(CASE WHEN sm.department != c.department THEN 1 ELSE 0 END) AS dept_mismatches,
    SUM(CASE WHEN sm.semester != c.semester THEN 1 ELSE 0 END) AS sem_mismatches
FROM registrations r
JOIN students_master sm ON r.student_id = sm.student_id
JOIN courses c ON r.course_id = c.id
WHERE sm.department != c.department
   OR sm.semester != c.semester;

-- ============================================================
-- Step 3: DELETE invalid registrations
-- Uncomment the lines below to execute the cleanup.
-- ============================================================
-- DELETE r FROM registrations r
-- JOIN students_master sm ON r.student_id = sm.student_id
-- JOIN courses c ON r.course_id = c.id
-- WHERE sm.department != c.department
--    OR sm.semester != c.semester;

-- ============================================================
-- Step 4: Verify — Should return 0 rows after cleanup
-- ============================================================
-- SELECT COUNT(*) AS remaining_invalid
-- FROM registrations r
-- JOIN students_master sm ON r.student_id = sm.student_id
-- JOIN courses c ON r.course_id = c.id
-- WHERE sm.department != c.department
--    OR sm.semester != c.semester;
