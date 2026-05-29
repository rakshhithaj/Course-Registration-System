const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock DB pool
jest.mock('../config/db', () => {
  const mockQuery = jest.fn();
  const mockRelease = jest.fn();
  const mockGetConnection = jest.fn().mockResolvedValue({
    query: mockQuery,
    release: mockRelease,
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
  });
  return {
    query: mockQuery,
    getConnection: mockGetConnection,
    _mockQuery: mockQuery,
    _mockRelease: mockRelease,
    _mockGetConnection: mockGetConnection,
  };
});

const app = require('../server');
const pool = require('../config/db');

// Helper to generate test JWT
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

afterEach(() => {
  jest.clearAllMocks();
});

// ==================== Auth Tests ====================
describe('POST /api/auth/login', () => {
  it('should return 400 if student_id is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Test1234' });
    expect(res.status).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ student_id: '1RV22CS001' });
    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid credentials', async () => {
    pool._mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ student_id: '1RV22CS001', password: 'Wrong1234' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/register', () => {
  it('should return 400 if password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        student_id: '1RV22CS001',
        email: 'test@university.edu',
        phone: '1234567890',
        password: 'short',
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        student_id: '1RV22CS001',
        email: 'not-an-email',
        phone: '1234567890',
        password: 'Test1234',
      });
    expect(res.status).toBe(400);
  });
});

// ==================== Protected Route Tests ====================
describe('Protected routes', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('should return 403 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(403);
  });
});
