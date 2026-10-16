const express = require('express');
const jsend = require('jsend');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const jwt = require('jsonwebtoken');

const db = require('../models');
const UserService = require('../services/UserService');

const pbkdf2 = promisify(crypto.pbkdf2);
const router = express.Router();
const userService = new UserService(db);

router.use(jsend.middleware);

router.post('/signup', async (req, res, next) => {
  const { name, email, password } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).jsend.fail({
      name: 'Name is required.',
    });
  }
  if (typeof email !== 'string' || email.trim() === '') {
    return res.status(400).jsend.fail({
      email: 'Email is required.',
    });
  }
  if (typeof password !== 'string' || password.trim() === '') {
    return res.status(400).jsend.fail({
      password: 'Password is required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await userService.getOne(normalizedEmail);
    if (existingUser) {
      return res.status(409).jsend.fail({
        email: 'Provided email is already in use.',
      });
    }
    const salt = crypto.randomBytes(16);
    const hashedPassword = await pbkdf2(password, salt, 310000, 32, 'sha256');
    await userService.create(
      name.trim(),
      normalizedEmail,
      hashedPassword,
      salt,
    );
    return res.status(201).jsend.success({
      result: 'You created an account.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || email.trim() === '') {
    return res.status(400).jsend.fail({
      email: 'Email is required.',
    });
  }
  if (typeof password !== 'string' || password.trim() === '') {
    return res.status(400).jsend.fail({
      password: 'Password is required.',
    });
  }
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await userService.getOne(normalizedEmail);
    if (!user) {
      return res.status(401).jsend.fail({
        result: 'Incorrect email or password',
      });
    }
    const hashedPassword = await pbkdf2(
      password,
      user.Salt,
      310000,
      32,
      'sha256',
    );
    if (!crypto.timingSafeEqual(user.EncryptedPassword, hashedPassword)) {
      return res.status(401).jsend.fail({
        result: 'Incorrect email or password',
      });
    }
    const token = jwt.sign(
      { id: user.id, email: user.Email },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' },
    );
    return res.jsend.success({
      result: 'You are logged in',
      id: user.id,
      email: user.Email,
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
