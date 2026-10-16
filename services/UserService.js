class UserService {
  constructor(db) {
    this.User = db.User;
    this.Result = db.Result;
  }

  async getOne(email) {
    return this.User.findOne({
      where: { Email: email },
    });
  }

  async create(name, email, encryptedPassword, salt) {
    return this.User.create({
      Name: name,
      Email: email,
      EncryptedPassword: encryptedPassword,
      Salt: salt,
    });
  }
  async delete(email) {
    const user = await this.getOne(email);

    if (!user) {
      return 0;
    }

    await this.Result.destroy({
      where: { UserId: user.id },
    });

    return user.destroy();
  }
}

module.exports = UserService;
