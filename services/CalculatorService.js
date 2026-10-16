class CalculatorService {
  add(number1, number2) {
    return number1 + number2;
  }

  subtract(number1, number2) {
    return number1 - number2;
  }

  multiply(number1, number2) {
    return number1 * number2;
  }

  divide(number1, number2) {
    return number1 / number2;
  }

  sqrt(number) {
    return Math.sqrt(number);
  }
}

module.exports = CalculatorService;
