const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/db', () => {
  const mockQuery = jest.fn();
  const mockRelease = jest.fn();
  const mockConn = {
    query: jest.fn(),
    release: mockRelease,
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  const mockGetConnection = jest.fn().mockResolvedValue(mockConn);
  return {
    query: mockQuery,
    getConnection: mockGetConnection,
    _mockQuery: mockQuery,
    _mockConn: mockConn,
  };
});

const app = require('../server');
const pool = require('../config/db');

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

afterEach(() => {
  jest.clearAllMocks();
});

const studentToken = jwt.sign(
  { id: 1, student_id: '1RV22CS001', role: 'student' },
  'testsecret',
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { id: 1, username: 'admin', role: 'admin' },
  'testsecret',
  { expiresIn: '1h' }
);

// ==================== Registration Tests ====================
describe('POST /api/registration/register', () => {
  it('should return 400 without course_id', async () => {
    const res = await request(app)
      .post('/api/registration/register')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('should return 403 for admin trying to register', async () => {
    const res = await request(app)
      .post('/api/registration/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ course_id: 1 });
    expect(res.status).toBe(403);
  });

  it('should return 409 for duplicate registration', async () => {
    // Mock: duplicate found
    pool._mockConn.query
      .mockResolvedValueOnce(undefined) // beginTransaction
      .mockResolvedValueOnce([[{ id: 1 }]]); // duplicate check finds existing

    const res = await request(app)
      .post('/api/registration/register')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ course_id: 1 });
    expect(res.status).toBe(409);
  });

  it('should return 404 for non-existent course', async () => {
    pool._mockConn.query
      .mockResolvedValueOnce(undefined) // beginTransaction
      .mockResolvedValueOnce([[]]) // no duplicate
      .mockResolvedValueOnce([[]]); // course not found

    const res = await request(app)
      .post('/api/registration/register')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ course_id: 999 });
    expect(res.status).toBe(404);
  });

  it('should return 409 when course is full', async () => {
    pool._mockConn.query
      .mockResolvedValueOnce(undefined) // beginTransaction
      .mockResolvedValueOnce([[]]) // no duplicate
      .mockResolvedValueOnce([[{ id: 1, course_code: 'CS201', course_name: 'OOP', credits: 4, capacity: 2, enrolled: 2 }]]); // full

    pool._mockQuery.mockResolvedValueOnce([{}]); // notification insert

    const res = await request(app)
      .post('/api/registration/register')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ course_id: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/full/i);
  });
});

// ==================== Drop Course Tests ====================
describe('DELETE /api/registration/drop', () => {
  it('should return 400 without course_id', async () => {
    const res = await request(app)
      .delete('/api/registration/drop')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('should return 404 when registration not found', async () => {
    pool._mockQuery
      .mockResolvedValueOnce([{ affectedRows: 0 }]); // delete finds nothing

    const res = await request(app)
      .delete('/api/registration/drop')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ course_id: 999 });
    expect(res.status).toBe(404);
  });
});

// ==================== My Courses Tests ====================
describe('GET /api/registration/my-courses', () => {
  it('should return courses for authenticated student', async () => {
    pool._mockQuery.mockResolvedValueOnce([[
      { id: 1, course_code: 'CS201', course_name: 'OOP', credits: 4, department: 'CS', faculty_name: 'Dr. Kumar', registered_at: new Date() },
    ]]);

    const res = await request(app)
      .get('/api/registration/my-courses')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('courses');
    expect(res.body).toHaveProperty('totalCredits');
    expect(res.body).toHaveProperty('availableCredits');
  });
});
