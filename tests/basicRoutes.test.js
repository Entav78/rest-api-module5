require('dotenv').config({ quiet: true });

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const addRouter = require('../routes/add');
const subtractRouter = require('../routes/subtract');
const multiplyRouter = require('../routes/multiply');
const divideRouter = require('../routes/divide');
const sqrtRouter = require('../routes/sqrt');

const app = express();

app.use('/add', addRouter);
app.use('/subtract', subtractRouter);
app.use('/multiply', multiplyRouter);
app.use('/divide', divideRouter);
app.use('/sqrt', sqrtRouter);

describe('Basic calculator routes', () => {
  test('GET /add/2/3 returns 5', async () => {
    const response = await request(app).get('/add/2/3');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
      },
    });
  });

  test('GET /add/banana/3 rejects an invalid number', async () => {
    const response = await request(app).get('/add/banana/3');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        number1: 'number1 is not in correct format',
      },
    });
  });

  test('GET /add/2/3 still calculates with an invalid token', async () => {
    const response = await request(app)
      .get('/add/2/3')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
        error: 'JWT token is invalid or expired',
      },
    });
  });

  test('GET /subtract/8/3 returns 5', async () => {
    const response = await request(app).get('/subtract/8/3');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
      },
    });
  });

  test('GET /subtract/8/banana rejects an invalid number', async () => {
    const response = await request(app).get('/subtract/8/banana');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        number2: 'number2 is not in correct format',
      },
    });
  });

  test('GET /multiply/4/3 returns 12', async () => {
    const response = await request(app).get('/multiply/4/3');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 12,
      },
    });
  });

  test('GET /multiply/potato/3 rejects an invalid number', async () => {
    const response = await request(app).get('/multiply/potato/3');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        number1: 'number1 is not in correct format',
      },
    });
  });

  test('GET /divide/9/2 returns a rounded result', async () => {
    const response = await request(app).get('/divide/9/2');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
        message: 'Result has been rounded, as it was not an integer.',
      },
    });
  });

  test('GET /divide/9/0 rejects division by zero', async () => {
    const response = await request(app).get('/divide/9/0');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        number2: 'number2 cannot be 0',
      },
    });
  });

  test('GET /divide/9/2 still rounds with an invalid token', async () => {
    const response = await request(app)
      .get('/divide/9/2')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
        message: 'Result has been rounded, as it was not an integer.',
        error: 'JWT token is invalid or expired',
      },
    });
  });

  test('GET /add/2/3 still calculates with an expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'expired-test@example.com' },
      process.env.TOKEN_SECRET,
      { expiresIn: -1 },
    );

    const response = await request(app)
      .get('/add/2/3')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
        error: 'JWT token is invalid or expired',
      },
    });
  });

  test('GET /sqrt/25 returns 5', async () => {
    const response = await request(app).get('/sqrt/25');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 5,
      },
    });
  });

  test('GET /sqrt/2 returns a rounded result', async () => {
    const response = await request(app).get('/sqrt/2');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: {
        result: 1,
        message: 'Result has been rounded, as it was not an integer.',
      },
    });
  });

  test('GET /sqrt/-9 rejects a negative number', async () => {
    const response = await request(app).get('/sqrt/-9');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      data: {
        number: 'number cannot be negative',
      },
    });
  });
});
