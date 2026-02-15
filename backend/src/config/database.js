const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for testing and development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' ? ':memory:' : './database.sqlite',
  logging: process.env.NODE_ENV === 'test' ? false : console.log,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

module.exports = {
  sequelize,
  Sequelize
};
