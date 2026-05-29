# System Architecture

## Overview

The Course Registration System follows a **3-tier architecture**:

```
┌──────────────────────────────────────────────────────────────┐
│                      PRESENTATION TIER                       │
│  React.js + Tailwind CSS + React Router                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Public   │ │ Student  │ │  Admin   │ │  Shared  │       │
│  │  Pages    │ │  Pages   │ │  Pages   │ │Components│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  AuthContext → Axios Interceptors → Protected Routes         │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/REST (JSON)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│  Node.js + Express.js                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Routes   │ │Middleware│ │Controllers│ │  Config  │       │
│  │          │ │ Auth/RBAC│ │ Business  │ │   DB     │       │
│  │          │ │ Validate │ │  Logic    │ │  Pool    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  Helmet → Rate Limiter → CORS → JWT Verify → Handler        │
└──────────────────────┬───────────────────────────────────────┘
                       │ SQL (Parameterized Queries)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                        DATA TIER                             │
│  MySQL 8.0                                                   │
│  ┌──────────────────────────────────────────────┐           │
│  │  10 Tables, Normalized (3NF)                 │           │
│  │  Foreign Keys, Unique Constraints, Indexes   │           │
│  │  CHECK constraints, ENUM types               │           │
│  └──────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

## Request Flow

1. User interacts with React UI
2. Axios sends HTTP request with JWT in Authorization header
3. Express receives request → Helmet headers → Rate limiter check
4. Route matched → Middleware chain (JWT verify → Role check → Input validation)
5. Controller executes business logic with parameterized SQL queries
6. MySQL processes query, returns results
7. Controller formats response → JSON sent to frontend
8. React updates UI state

## Registration Validation Flow

```
Student clicks "Register for Course"
         │
         ▼
    ┌─── Duplicate Check ───┐
    │ Already registered?    │── YES → 409 Conflict
    └────────┬───────────────┘
             │ NO
             ▼
    ┌─── Seat Check ─────────┐
    │ enrolled < capacity?    │── NO → 409 Course Full
    └────────┬────────────────┘
             │ YES
             ▼
    ┌─── Prerequisite Check ──┐
    │ All prereqs completed?   │── NO → 400 Missing prereqs
    └────────┬─────────────────┘
             │ YES
             ▼
    ┌─── Credit Limit Check ──┐
    │ total + new ≤ 24?        │── NO → 400 Credit exceeded
    └────────┬─────────────────┘
             │ YES
             ▼
    ┌─── Schedule Conflict ───┐
    │ Any time overlap?        │── YES → 409 Conflict
    └────────┬─────────────────┘
             │ NO
             ▼
    ✅ INSERT registration
    ✅ INSERT notification
    ✅ COMMIT transaction
```
