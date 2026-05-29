const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/db', () => {
  const mockQuery = jest.fn();
  return {
    query: mockQuery,
    getConnection: jest.fn().mockResolvedValue({
      query: mockQuery,
      release: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
    _mockQuery: mockQuery,
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

const adminToken = jwt.sign(
  { id: 1, username: 'admin', role: 'admin' },
  'testsecret',
  { expiresIn: '1h' }
);

const studentToken = jwt.sign(
  { id: 1, student_id: '1RV22CS001', role: 'student' },
  'testsecret',
  { expiresIn: '1h' }
);

// ==================== GET /api/courses ====================
describe('GET /api/courses', () => {
  it('should return courses list', async () => {
    pool._mockQuery.mockResolvedValueOnce([[
      { id: 1, course_code: 'CS201', course_name: 'OOP', credits: 4, capacity: 60, enrolled: 10, department: 'CS' },
    ]]);

    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('available_seats');
  });

  it('should accept search query', async () => {
    pool._mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/courses?search=machine');
    expect(res.status).toBe(200);
  });
});

// ==================== POST /api/courses (admin) ====================
describe('POST /api/courses', () => {
  it('should return 403 for student', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        course_code: 'CS501',
        course_name: 'Test',
        credits: 3,
        capacity: 50,
        department: 'CS',
        semester: 5,
      });
    expect(res.status).toBe(403);
  });

  it('should return 400 if required fields missing', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ course_code: 'CS501' });
    expect(res.status).toBe(400);
  });

  it('should create course for admin', async () => {
    pool._mockQuery.mockResolvedValueOnce([{ insertId: 17 }]);

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        course_code: 'CS501',
        course_name: 'Advanced Topics',
        credits: 3,
        capacity: 40,
        department: 'Computer Science',
        semester: 7,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});

// ==================== DELETE /api/courses/:id (admin) ====================
describe('DELETE /api/courses/:id', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).delete('/api/courses/1');
    expect(res.status).toBe(401);
  });

  it('should delete course for admin', async () => {
    pool._mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .delete('/api/courses/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
