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

router.get('/:number', optionalAuthentication, async (req, res, next) => {
  const number = parseInt(req.params.number, 10);

  if (Number.isNaN(number)) {
    return res.status(400).jsend.fail({
      number: 'number is not in correct format',
    });
  }

  if (number < 0) {
    return res.status(400).jsend.fail({
      number: 'number cannot be negative',
    });
  }

  try {
    const result = calculatorService.sqrt(number);
    const roundedResult = Math.round(result);

    if (req.user) {
      await resultService.create('sqrt', roundedResult, req.user.id);
    }

    const data = {
      result: roundedResult,
    };

    if (!Number.isInteger(result)) {
      data.message = 'Result has been rounded, as it was not an integer.';
    }

    if (req.authenticationError) {
      data.error = req.authenticationError;
    }

    return res.jsend.success(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
