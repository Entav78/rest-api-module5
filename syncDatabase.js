require('dotenv').config();

const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Database tables are ready.');
  } catch (error) {
    console.error('Database sync failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
