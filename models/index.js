const { Sequelize } = require('sequelize');
const createUserModel = require('./User');
const createResultModel = require('./Result');

const connectionSettings = {
  dialect: process.env.DIALECT,
  database: process.env.DATABASE_NAME,
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  host: process.env.HOST,
};

const sequelize = new Sequelize(connectionSettings);
const User = createUserModel(sequelize);
const Result = createResultModel(sequelize);

User.hasOne(Result, {
  foreignKey: {
    name: 'UserId',
    allowNull: false,
  },
});

Result.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: false,
  },
});

module.exports = { sequelize, User, Result };
