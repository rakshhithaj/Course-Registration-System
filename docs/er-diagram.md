# Entity-Relationship Diagram

## ER Diagram (Text-Based)

```
┌─────────────────────────┐         ┌─────────────────────────┐
│     students_master     │         │     student_accounts     │
├─────────────────────────┤         ├─────────────────────────┤
│ PK id                   │───1:1───│ PK id                   │
│    student_id (UNIQUE)  │         │ FK student_id (UNIQUE)  │
│    name                 │         │    email (UNIQUE)       │
│    email                │         │    phone                │
│    department           │         │    password_hash        │
│    semester             │         │    created_at           │
│    year_of_admission    │         └─────────────────────────┘
│    created_at           │
└────────┬────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│     registrations       │         │        courses          │
├─────────────────────────┤         ├─────────────────────────┤
│ PK id                   │───N:1───│ PK id                   │
│ FK student_id           │         │    course_code (UNIQUE) │
│ FK course_id            │         │    course_name          │
│    registered_at        │         │    department           │
│                         │         │    credits (1-6)        │
│ UQ (student_id,         │         │    capacity (≥1)        │
│     course_id)          │         │    enrolled (≥0)        │
└─────────────────────────┘         │    semester             │
                                    │    description          │
         ┌──────────────────────────│ FK faculty_id           │
         │                          │    created_at           │
         │                          └────────┬────────────────┘
         │                                   │
         ▼                                   │ 1:N
┌─────────────────────────┐                  ▼
│        faculty          │         ┌─────────────────────────┐
├─────────────────────────┤         │       schedules         │
│ PK id                   │         ├─────────────────────────┤
│    name                 │         │ PK id                   │
│    email (UNIQUE)       │         │ FK course_id            │
│    department           │         │    day (ENUM)           │
│    designation          │         │    start_time (TIME)    │
│    created_at           │         │    end_time (TIME)      │
└─────────────────────────┘         │    room                 │
                                    └─────────────────────────┘

┌─────────────────────────┐
│     prerequisites       │         ┌─────────────────────────┐
├─────────────────────────┤         │   completed_courses     │
│ PK id                   │         ├─────────────────────────┤
│ FK course_id ───────────│──┐      │ PK id                   │
│ FK prerequisite_id ─────│──┘      │ FK student_id           │
│                         │  │      │ FK course_id            │
│ UQ (course_id,          │  │      │    grade                │
│     prerequisite_id)    │  │      │    completed_at         │
└─────────────────────────┘  │      │                         │
                             │      │ UQ (student_id,         │
    Both FKs reference ──────┘      │     course_id)          │
    courses.id                      └─────────────────────────┘

┌─────────────────────────┐         ┌─────────────────────────┐
│      notifications      │         │        admins           │
├─────────────────────────┤         ├─────────────────────────┤
│ PK id                   │         │ PK id                   │
│ FK student_id           │         │    username (UNIQUE)    │
│    message              │         │    password_hash        │
│    is_read (default 0)  │         │    created_at           │
│    created_at           │         └─────────────────────────┘
└─────────────────────────┘
```

## Relationships Summary

| Relationship                          | Type | Cardinality |
|---------------------------------------|------|-------------|
| students_master → student_accounts    | 1:1  | Optional    |
| students_master → registrations       | 1:N  | Optional    |
| students_master → completed_courses   | 1:N  | Optional    |
| students_master → notifications       | 1:N  | Optional    |
| courses → registrations               | 1:N  | Optional    |
| courses → schedules                   | 1:N  | Optional    |
| courses → prerequisites (as course)   | 1:N  | Optional    |
| courses → prerequisites (as prereq)   | 1:N  | Optional    |
| courses → completed_courses           | 1:N  | Optional    |
| faculty → courses                     | 1:N  | Optional    |

## Key Indexes

| Table             | Index                            | Purpose                     |
|-------------------|----------------------------------|-----------------------------|
| student_accounts  | UNIQUE(student_id)               | Prevent duplicate accounts  |
| student_accounts  | UNIQUE(email)                    | Prevent duplicate emails    |
| registrations     | UNIQUE(student_id, course_id)    | Prevent double registration |
| courses           | UNIQUE(course_code)              | Prevent duplicate codes     |
| courses           | INDEX(department)                | Fast department filtering   |
| courses           | INDEX(semester)                  | Fast semester filtering     |
| registrations     | INDEX(student_id)                | Fast student lookup         |
| registrations     | INDEX(course_id)                 | Fast course lookup          |
| schedules         | INDEX(course_id)                 | Fast schedule lookup        |
