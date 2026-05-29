# API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require: `Authorization: Bearer <token>`

---

## Authentication

### POST /auth/register
Register a new student account.

**Body:**
```json
{
  "student_id": "1RV22CS001",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass1!"
}
```

**Validation:**
- `student_id` must exist in `students_master`
- `student_id` must not already have an account
- `email` must be valid format
- `password` minimum 6 characters

**Response (201):**
```json
{
  "message": "Registration successful. You can now login."
}
```

**Errors:** `400` validation error, `409` duplicate student ID or email

---

### POST /auth/login
Student login.

**Body:**
```json
{
  "student_id": "1RV22CS001",
  "password": "SecurePass1!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "student_id": "1RV22CS001",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### POST /auth/admin/login
Admin login.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

### POST /auth/change-password
Change current student's password. Requires authentication.

**Body:**
```json
{
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass2!"
}
```

**Response (200):**
```json
{ "message": "Password updated successfully" }
```

---

### GET /auth/profile
Get current student's profile. Requires authentication.

**Response (200):**
```json
{
  "id": 1,
  "student_id": "1RV22CS001",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "department": "Computer Science"
}
```

---

## Students (Admin Only)

All endpoints require admin authentication.

### GET /students
List all students from master records.

**Response (200):**
```json
[
  {
    "id": 1,
    "student_id": "1RV22CS001",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Computer Science",
    "semester": 5,
    "year_of_admission": 2022
  }
]
```

### GET /students/:id
Get a single student by database ID.

### POST /students
Add a student to master records.

**Body:**
```json
{
  "student_id": "1RV22CS011",
  "name": "New Student",
  "email": "new@example.com",
  "department": "Computer Science",
  "semester": 1,
  "year_of_admission": 2024
}
```

### PUT /students/:id
Update student master record.

### DELETE /students/:id
Delete student from master records.

---

## Courses

### GET /courses
List courses with optional filters.

**Query Parameters:**
| Parameter   | Type   | Description              |
|-------------|--------|--------------------------|
| department  | string | Filter by department     |
| semester    | number | Filter by semester       |
| credits     | number | Filter by credit count   |
| search      | string | Search name/code/desc    |

**Response (200):**
```json
[
  {
    "id": 1,
    "course_code": "CS501",
    "course_name": "Data Structures",
    "department": "Computer Science",
    "credits": 4,
    "capacity": 60,
    "enrolled": 42,
    "semester": 5,
    "faculty_name": "Dr. Smith"
  }
]
```

### GET /courses/:id
Course detail with prerequisites and schedule.

**Response (200):**
```json
{
  "id": 1,
  "course_code": "CS501",
  "course_name": "Data Structures",
  "department": "Computer Science",
  "credits": 4,
  "capacity": 60,
  "enrolled": 42,
  "semester": 5,
  "faculty_name": "Dr. Smith",
  "prerequisites": [
    { "course_code": "CS301", "course_name": "Programming Fundamentals" }
  ],
  "schedule": [
    { "day": "Monday", "start_time": "09:00", "end_time": "10:00", "room": "CS-101" }
  ]
}
```

### POST /courses (Admin)
Create a new course.

**Body:**
```json
{
  "course_code": "CS601",
  "course_name": "Machine Learning",
  "department": "Computer Science",
  "credits": 4,
  "capacity": 50,
  "semester": 6,
  "faculty_id": 1,
  "description": "Introduction to ML algorithms"
}
```

### PUT /courses/:id (Admin)
Update course details.

### DELETE /courses/:id (Admin)
Delete a course.

---

## Registration (Student Only)

All endpoints require student authentication.

### POST /registration/register
Register for a course.

**Body:**
```json
{ "course_id": 1 }
```

**Validation (in order):**
1. Not already registered → `409`
2. Seats available → `409`
3. Prerequisites met → `400` (lists missing courses)
4. Total credits ≤ 24 → `400`
5. No schedule conflicts → `409` (lists conflicting course)

**Response (201):**
```json
{ "message": "Successfully registered for Data Structures" }
```

### DELETE /registration/drop
Drop a registered course.

**Body:**
```json
{ "course_id": 1 }
```

**Response (200):**
```json
{ "message": "Successfully dropped Data Structures" }
```

### GET /registration/my-courses
List student's registered courses with credit summary.

**Response (200):**
```json
{
  "courses": [
    {
      "id": 1,
      "course_code": "CS501",
      "course_name": "Data Structures",
      "credits": 4,
      "department": "Computer Science",
      "faculty_name": "Dr. Smith",
      "registered_at": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCredits": 16,
  "maxCredits": 24
}
```

---

## Faculty (Admin Only)

### GET /faculty
List all faculty members.

### GET /faculty/:id
Get faculty by ID.

### POST /faculty
Create faculty member.

**Body:**
```json
{
  "name": "Dr. New Faculty",
  "email": "faculty@example.com",
  "department": "Computer Science",
  "designation": "Assistant Professor"
}
```

### PUT /faculty/:id
Update faculty.

### DELETE /faculty/:id
Delete faculty.

---

## Schedules (Admin Only for mutations)

### GET /schedules
List all schedules.

### GET /schedules/course/:courseId
Get schedule for a specific course.

### POST /schedules (Admin)
Create schedule entry.

**Body:**
```json
{
  "course_id": 1,
  "day": "Monday",
  "start_time": "09:00",
  "end_time": "10:00",
  "room": "CS-101"
}
```

**Validation:** Detects room conflicts (same room, day, overlapping time).

### PUT /schedules/:id (Admin)
Update schedule entry.

### DELETE /schedules/:id (Admin)
Delete schedule entry.

---

## Notifications

### GET /notifications (Student)
Get current student's notifications.

**Response (200):**
```json
[
  {
    "id": 1,
    "message": "You have been registered for Data Structures",
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### PUT /notifications/:id/read (Student)
Mark a notification as read.

### PUT /notifications/read-all (Student)
Mark all notifications as read.

### POST /notifications (Admin)
Send notification.

**Body:**
```json
{
  "student_id": 1,
  "message": "Your schedule has been updated"
}
```
Use `"student_id": "all"` to broadcast to all students.

---

## Reports (Admin Only)

### GET /reports/students
Student enrollment report with courses.

### GET /reports/courses
Course capacity and enrollment report.

### GET /reports/departments
Department aggregate statistics.

---

## Admin Dashboard

### GET /admin/dashboard
Dashboard statistics.

**Response (200):**
```json
{
  "stats": {
    "totalStudents": 10,
    "totalCourses": 16,
    "totalRegistrations": 25,
    "totalFaculty": 8,
    "totalDepartments": 5
  },
  "recentRegistrations": [...]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "errors": [
    { "msg": "Field-specific error", "path": "field_name" }
  ]
}
```

### HTTP Status Codes
| Code | Meaning                    |
|------|----------------------------|
| 200  | Success                    |
| 201  | Created                    |
| 400  | Validation error           |
| 401  | Unauthorized (no/bad token)|
| 403  | Forbidden (wrong role)     |
| 404  | Resource not found         |
| 409  | Conflict (duplicate, full) |
| 429  | Rate limit exceeded        |
| 500  | Internal server error      |
