const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const State = require('./state');

class Town extends Model {}

Town.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'states',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Town',
    tableName: 'towns',
    timestamps: false
});

module.exports = Town;
