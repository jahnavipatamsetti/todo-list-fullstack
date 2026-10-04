const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Set up associations
User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks',
  onDelete: 'CASCADE'
});
Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = Task;
