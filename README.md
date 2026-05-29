# Course Registration System

A production-quality, full-stack web application for college/university course registration with real-time seat availability, prerequisite validation, schedule conflict detection, and secure Student ID-based authentication.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Database Design](#database-design)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

---

## Features

### Student Module
- **Registration & Login** using Student ID (verified against master records)
- **Duplicate Prevention** — one account per Student ID (`UNIQUE(student_id)`)
- **Course Catalog** with filters (department, semester, faculty, search)
- **Smart Registration** with 5-layer validation:
  1. Duplicate registration check
  2. Seat availability check
  3. Prerequisite verification
  4. Credit limit enforcement (max 24)
  5. Schedule conflict detection
- **Drop courses** with notifications
- **Dashboard** with credit summary and upcoming notifications

### Admin Module
- **Student CRUD** — Add/edit/delete master student records
- **Course Management** — Full course lifecycle with faculty assignment
- **Faculty Management** — Add/edit/delete faculty members
- **Schedule Management** — Timetable creation with room conflict detection
- **Reports** — Student enrollment, course, and department reports with CSV export
- **Notifications** — Send to individual students or broadcast to all

### Security
- JWT authentication with role-based access control
- bcrypt password hashing (10 salt rounds)
- Helmet.js security headers
- Rate limiting (100 requests per 15 minutes)
- SQL injection prevention (parameterized queries)
- XSS prevention (input validation + Helmet)
- CORS configuration

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   React.js      │────▶│  Express.js      │────▶│   MySQL      │
│   (Frontend)    │     │  (REST API)      │     │  (Database)  │
│                 │     │                  │     │              │
│  - React Router │     │  - JWT Auth      │     │  - 10 Tables │
│  - Axios        │     │  - Validation    │     │  - Indexes   │
│  - Tailwind CSS │     │  - Rate Limiting │     │  - FKs       │
│  - Hot Toast    │     │  - Helmet        │     │  - Triggers  │
└─────────────────┘     └──────────────────┘     └──────────────┘
     Port 5173               Port 5000
```

---

## Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18, React Router 6, Tailwind CSS 3  |
| HTTP Client | Axios                                     |
| Backend     | Node.js, Express.js 4                     |
| Auth        | JWT (jsonwebtoken), bcrypt                |
| Database    | MySQL 8.0+                                |
| Validation  | express-validator                         |
| Security    | Helmet, CORS, express-rate-limit          |
| Testing     | Jest, Supertest                           |

---

## Folder Structure

```
Course-Registration-System/
├── README.md
├── database/
│   ├── schema.sql              # Full database schema
│   └── seed.sql                # Sample data
├── docs/
│   ├── architecture.md         # System architecture
│   ├── api-documentation.md    # Complete API docs
│   └── er-diagram.md           # ER diagram (text-based)
├── backend/
│   ├── package.json
│   ├── server.js               # Express app entry
│   ├── .env.example
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js             # JWT + RBAC middleware
│   │   └── validate.js         # Express-validator check
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   ├── registrationController.js
│   │   ├── adminController.js
│   │   ├── facultyController.js
│   │   ├── scheduleController.js
│   │   ├── notificationController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── courses.js
│   │   ├── registration.js
│   │   ├── admin.js
│   │   ├── faculty.js
│   │   ├── schedules.js
│   │   ├── notifications.js
│   │   └── reports.js
│   └── tests/
│       ├── auth.test.js
│       ├── registration.test.js
│       └── courses.test.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axios.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Navbar.jsx
        │   ├── Modal.jsx
        │   ├── ProtectedRoute.jsx
        │   └── UI.jsx
        └── pages/
            ├── public/
            │   ├── Home.jsx
            │   ├── About.jsx
            │   └── Contact.jsx
            ├── student/
            │   ├── Login.jsx
            │   ├── Register.jsx
            │   ├── Dashboard.jsx
            │   ├── Courses.jsx
            │   ├── MyCourses.jsx
            │   └── Notifications.jsx
            └── admin/
                ├── AdminLogin.jsx
                ├── AdminDashboard.jsx
                ├── AdminStudents.jsx
                ├── AdminCourses.jsx
                ├── AdminFaculty.jsx
                └── AdminReports.jsx
```

---

## Database Design

### ER Diagram

```
students_master ──1:1── student_accounts
       │
       ├──1:N── registrations ──N:1── courses ──N:1── faculty
       │                                  │
       ├──1:N── completed_courses         ├──1:N── schedules
       │                                  │
       └──1:N── notifications             └──M:N── prerequisites
```

### Tables

| Table              | Purpose                                      |
|--------------------|----------------------------------------------|
| students_master    | Official student records (admin-managed)      |
| student_accounts   | Login accounts (1:1 with master, UNIQUE ID)   |
| admins             | Admin login credentials                       |
| courses            | Course catalog                                |
| faculty            | Faculty members                               |
| prerequisites      | Course prerequisite mappings                  |
| schedules          | Class timetable (day, time, room)             |
| registrations      | Student-course enrollment (UNIQUE pair)       |
| completed_courses  | Past courses for prerequisite validation      |
| notifications      | Student notification messages                 |

### Key Constraints
- `student_accounts.student_id` — `UNIQUE` (prevents duplicate accounts)
- `registrations(student_id, course_id)` — `UNIQUE` (prevents double registration)
- All foreign keys with proper cascade rules

---

## Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Course-Registration-System.git
cd Course-Registration-System
```

### 2. Set up the database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 3. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
npm install
```

### 4. Configure frontend
```bash
cd ../frontend
npm install
```

### 5. Start development servers
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 6. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### Default Credentials
- **Admin**: username `admin`, password `admin123`
- **Students**: Register using Student IDs from `students_master` (e.g., `1RV22CS001`)

---

## Environment Variables

| Variable             | Description                    | Default                  |
|----------------------|--------------------------------|--------------------------|
| PORT                 | Backend server port            | 5000                     |
| NODE_ENV             | Environment                    | development              |
| DB_HOST              | MySQL host                     | localhost                |
| DB_USER              | MySQL user                     | root                     |
| DB_PASSWORD          | MySQL password                 | —                        |
| DB_NAME              | MySQL database name            | course_registration      |
| JWT_SECRET           | JWT signing secret             | —                        |
| JWT_EXPIRES_IN       | Token expiration               | 24h                      |
| FRONTEND_URL         | CORS allowed origin            | http://localhost:5173    |
| RATE_LIMIT_WINDOW_MS | Rate limit window (ms)         | 900000                   |
| RATE_LIMIT_MAX       | Max requests per window        | 100                      |

---

## API Documentation

### Authentication
| Method | Endpoint                   | Access   | Description              |
|--------|----------------------------|----------|--------------------------|
| POST   | /api/auth/register         | Public   | Student registration     |
| POST   | /api/auth/login            | Public   | Student login            |
| POST   | /api/auth/admin/login      | Public   | Admin login              |
| POST   | /api/auth/logout           | Auth     | Logout                   |
| POST   | /api/auth/change-password  | Student  | Change password          |
| POST   | /api/auth/forgot-password  | Public   | Request password reset   |
| GET    | /api/auth/profile          | Student  | Get current profile      |

### Students (Admin only)
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | /api/students       | List all students        |
| GET    | /api/students/:id   | Get student by ID        |
| POST   | /api/students       | Add to master records    |
| PUT    | /api/students/:id   | Update student           |
| DELETE | /api/students/:id   | Delete student           |

### Courses
| Method | Endpoint          | Access  | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | /api/courses      | Public  | List courses (filter) |
| GET    | /api/courses/:id  | Public  | Course details        |
| POST   | /api/courses      | Admin   | Create course         |
| PUT    | /api/courses/:id  | Admin   | Update course         |
| DELETE | /api/courses/:id  | Admin   | Delete course         |

### Registration (Student only)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/registration/register    | Register for a course    |
| DELETE | /api/registration/drop        | Drop a course            |
| GET    | /api/registration/my-courses  | List registered courses  |

### Reports (Admin only)
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| GET    | /api/reports/students   | Student enrollment     |
| GET    | /api/reports/courses    | Course report          |
| GET    | /api/reports/departments| Department summary     |

---

## Security

| Measure                | Implementation                                |
|------------------------|-----------------------------------------------|
| Authentication         | JWT with configurable secret                  |
| Password Storage       | bcrypt (10 salt rounds)                       |
| SQL Injection          | Parameterized queries via mysql2              |
| XSS Prevention         | Helmet.js headers + input sanitization        |
| Rate Limiting          | express-rate-limit (100 req/15 min)           |
| CORS                   | Whitelist-based origin configuration          |
| RBAC                   | Middleware-level role checks (student/admin)  |
| Input Validation       | express-validator on all endpoints            |

---

## Testing

```bash
cd backend
npm test
```

### Test Coverage
- **Unit Tests**: Authentication, input validation, authorization
- **Integration Tests**: Registration flow, course management, drop flow
- **Edge Cases**: Duplicate registration, full course, schedule conflicts, invalid tokens

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy via Vercel CLI or GitHub integration
```

### Backend → Render
1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables
4. Build command: `npm install`
5. Start command: `npm start`

### Database → PlanetScale / Railway / AWS RDS
1. Create MySQL 8.0 instance
2. Run `database/schema.sql`
3. Run `database/seed.sql`
4. Update `DB_*` environment variables

---

## Screenshots

> _Screenshots placeholder — add screenshots of:_
> 1. Home page
> 2. Student login
> 3. Student dashboard
> 4. Course catalog with filters
> 5. Course registration modal
> 6. My courses (with drop)
> 7. Notifications
> 8. Admin dashboard
> 9. Admin course management
> 10. Reports with CSV export

---

## Future Improvements

- [ ] Email OTP verification during registration
- [ ] Password reset via email link
- [ ] Waitlist system for full courses
- [ ] Student profile photo upload
- [ ] PDF report generation
- [ ] WebSocket for real-time seat updates
- [ ] Calendar view for timetable
- [ ] Mobile app (React Native)
- [ ] Audit logging for admin actions
- [ ] Two-factor authentication
- [ ] Course rating/feedback system
- [ ] Integration with university SSO (SAML/OAuth)
