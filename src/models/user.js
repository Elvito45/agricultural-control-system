const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'farms',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'User'
});

module.exports = User;