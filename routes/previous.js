const express = require('express');
const jsend = require('jsend');

const db = require('../models');
const CalculatorService = require('../services/CalculatorService');
const ResultService = require('../services/ResultService');
const {
  optionalAuthentication,
  requireAuthentication,
} = require('../middleware/authentication');

const router = express.Router();
const calculatorService = new CalculatorService();
const resultService = new ResultService(db);

router.use(jsend.middleware);
router.use(optionalAuthentication);
router.use(requireAuthentication);

router.get('/add/:number1', async (req, res, next) => {
  const number1 = parseInt(req.params.number1, 10);
  if (Number.isNaN(number1)) {
    return res.status(400).jsend.fail({
      number1: 'number1 is not in correct format',
    });
  }
  try {
    const previous = await resultService.getOne(req.user.id);
    if (!previous) {
      return res.status(404).jsend.fail({
        result: 'No previous result found. Perform a basic calculation first.',
      });
    }
    const result = calculatorService.add(previous.Value, number1);
    await resultService.create('add', result, req.user.id);
    return res.jsend.success({
      result,
      previousOperation: previous.OperationName,
      previousValue: previous.Value,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/subtract/:number1', async (req, res, next) => {
  const number1 = parseInt(req.params.number1, 10);

  if (Number.isNaN(number1)) {
    return res.status(400).jsend.fail({
      number1: 'number1 is not in correct format',
    });
  }
  try {
    const previous = await resultService.getOne(req.user.id);

    if (!previous) {
      return res.status(404).jsend.fail({
        result: 'No previous result found. Perform a basic calculation first.',
      });
    }
    const result = calculatorService.subtract(previous.Value, number1);
    await resultService.create('subtract', result, req.user.id);
    return res.jsend.success({
      result,
      previousOperation: previous.OperationName,
      previousValue: previous.Value,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/multiply/:number1', async (req, res, next) => {
  const number1 = parseInt(req.params.number1, 10);

  if (Number.isNaN(number1)) {
    return res.status(400).jsend.fail({
      number1: 'number1 is not in correct format',
    });
  }
  try {
    const previous = await resultService.getOne(req.user.id);

    if (!previous) {
      return res.status(404).jsend.fail({
        result: 'No previous result found. Perform a basic calculation first.',
      });
    }
    const result = calculatorService.multiply(previous.Value, number1);
    await resultService.create('multiply', result, req.user.id);
    return res.jsend.success({
      result,
      previousOperation: previous.OperationName,
      previousValue: previous.Value,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/divide/:number1', async (req, res, next) => {
  const number1 = parseInt(req.params.number1, 10);

  if (Number.isNaN(number1)) {
    return res.status(400).jsend.fail({
      number1: 'number1 is not in correct format',
    });
  }
  if (number1 === 0) {
    return res.status(400).jsend.fail({
      number1: 'number1 cannot be 0',
    });
  }
  try {
    const previous = await resultService.getOne(req.user.id);

    if (!previous) {
      return res.status(404).jsend.fail({
        result: 'No previous result found. Perform a basic calculation first.',
      });
    }
    const result = calculatorService.divide(previous.Value, number1);
    await resultService.create('divide', Math.round(result), req.user.id);
    if (Number.isInteger(result)) {
      return res.jsend.success({
        result,
        previousOperation: previous.OperationName,
        previousValue: previous.Value,
      });
    }
    return res.jsend.success({
      result: Math.round(result),
      previousOperation: previous.OperationName,
      previousValue: previous.Value,
      message: 'Result has been rounded, as it was not an integer.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sqrt', async (req, res, next) => {
  try {
    const previous = await resultService.getOne(req.user.id);

    if (!previous) {
      return res.status(404).jsend.fail({
        result: 'No previous result found. Perform a basic calculation first.',
      });
    }

    if (previous.Value < 0) {
      return res.status(400).jsend.fail({
        result: 'Previous value cannot be negative',
      });
    }

    const result = calculatorService.sqrt(previous.Value);
    const roundedResult = Math.round(result);

    await resultService.create('sqrt', roundedResult, req.user.id);

    const data = {
      result: roundedResult,
      previousOperation: previous.OperationName,
      previousValue: previous.Value,
    };

    if (!Number.isInteger(result)) {
      data.message = 'Result has been rounded, as it was not an integer.';
    }

    return res.jsend.success(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
