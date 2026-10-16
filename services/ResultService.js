class ResultService {
  constructor(db) {
    this.Result = db.Result;
  }

  async getOne(userId) {
    return this.Result.findOne({
      where: { UserId: userId },
    });
  }

  async create(operationName, value, userId) {
    const previous = await this.getOne(userId);

    if (previous) {
      return previous.update({
        OperationName: operationName,
        Value: value,
      });
    }
    return this.Result.create({
      OperationName: operationName,
      Value: value,
      UserId: userId,
    });
  }
}

module.exports = ResultService;
