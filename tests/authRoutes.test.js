require('dotenv').config({ quiet: true });

const crypto = require('node:crypto');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const authRouter = require('../routes/auth');
const addRouter = require('../routes/add');
const previousRouter = require('../routes/previous');
const db = require('../models');
const UserService = require('../services/UserService');

const app = express();

app.use(express.json());
app.use('/', authRouter);
app.use('/add', addRouter);
app.use('/previous', previousRouter);

const testUser = {
  name: 'Integration Test User',
  email: `calculator-test-${crypto.randomUUID()}@example.com`,
  password: 'CalculatorTest123!',
};

const userService = new UserService(db);

afterAll(async () => {
  try {
    await userService.delete(testUser.email);
  } finally {
    await db.sequelize.close();
  }
});

describe('Authenticated calculator flow', () => {
  let token;
  test('POST /signup creates a user', async () => {
    const response = await request(app).post('/signup').send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 'You created an account.',
      },
    });
  });

  test('POST /login returns a JWT', async () => {
    const response = await request(app).post('/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.result).toBe('You are logged in');
    expect(response.body.data.email).toBe(testUser.email);
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.token.length).toBeGreaterThan(0);
    token = response.body.data.token;
  });

  test('GET /add/20/22 saves the result for the logged-in user', async () => {
    const response = await request(app)
      .get('/add/20/22')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 42,
      },
    });
  });

  test('GET /previous/add/8 uses the saved result', async () => {
    const response = await request(app)
      .get('/previous/add/8')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 50,
        previousOperation: 'add',
        previousValue: 42,
      },
    });
  });

  test('GET /previous/add/8 requires authentication', async () => {
    const response = await request(app).get('/previous/add/8');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        result: 'JWT token not provided',
      },
    });
  });

  test('GET /previous/subtract/5 subtracts from the saved result', async () => {
    await request(app)
      .get('/add/20/22')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const response = await request(app)
      .get('/previous/subtract/5')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 37,
        previousOperation: 'add',
        previousValue: 42,
      },
    });
  });

  test('GET /previous/multiply/3 multiplies the saved result', async () => {
    await request(app)
      .get('/add/2/3')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const response = await request(app)
      .get('/previous/multiply/3')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 15,
        previousOperation: 'add',
        previousValue: 5,
      },
    });
  });

  test('GET /previous/divide/2 rounds the divided result', async () => {
    await request(app)
      .get('/add/2/3')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const response = await request(app)
      .get('/previous/divide/2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 3,
        previousOperation: 'add',
        previousValue: 5,
        message: 'Result has been rounded, as it was not an integer.',
      },
    });
  });

  test('GET /previous/add/8 rejects an invalid token', async () => {
    const response = await request(app)
      .get('/previous/add/8')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        result: 'JWT token is invalid or expired',
      },
    });
  });

  test('GET /previous/add/8 rejects an expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'expired-test@example.com' },
      process.env.TOKEN_SECRET,
      { expiresIn: -1 },
    );

    const response = await request(app)
      .get('/previous/add/8')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        result: 'JWT token is invalid or expired',
      },
    });
  });

  test('GET /previous/sqrt uses the saved result', async () => {
    await request(app)
      .get('/add/20/5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const response = await request(app)
      .get('/previous/sqrt')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
        previousOperation: 'add',
        previousValue: 25,
      },
    });
  });

  test('GET /previous/sqrt rejects a negative saved value', async () => {
    await request(app)
      .get('/add/-10/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const response = await request(app)
      .get('/previous/sqrt')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        result: 'Previous value cannot be negative',
      },
    });
  });
});
