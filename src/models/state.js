const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class State extends Model {}

State.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    iso_3166_2: {
        type: DataTypes.STRING(4),
        allowNull: false,
        field: 'iso_3166-2'
    },
    seal_number: {
        type: DataTypes.STRING(2),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'State',
    tableName: 'states',
    timestamps: false
});

module.exports = State;
