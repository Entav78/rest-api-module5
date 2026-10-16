const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Result = sequelize.define(
    'Result',
    {
      OperationName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Value: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );

  return Result;
};
