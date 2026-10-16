const express = require('express');
const jsend = require('jsend');

const CalculatorService = require('../services/CalculatorService');
const db = require('../models');
const ResultService = require('../services/ResultService');
const { optionalAuthentication } = require('../middleware/authentication');

const router = express.Router();
const calculatorService = new CalculatorService();
const resultService = new ResultService(db);

router.use(jsend.middleware);

router.get(
  '/:number1/:number2',
  optionalAuthentication,
  async (req, res, next) => {
    const number1 = parseInt(req.params.number1, 10);
    if (Number.isNaN(number1)) {
      return res.status(400).jsend.fail({
        number1: 'number1 is not in correct format',
      });
    }
    const number2 = parseInt(req.params.number2, 10);
    if (Number.isNaN(number2)) {
      return res.status(400).jsend.fail({
        number2: 'number2 is not in correct format',
      });
    }

    try {
      const result = calculatorService.subtract(number1, number2);

      if (req.user) {
        await resultService.create('subtract', result, req.user.id);
      }

      const data = { result };

      if (req.authenticationError) {
        data.error = req.authenticationError;
      }

      return res.jsend.success(data);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
