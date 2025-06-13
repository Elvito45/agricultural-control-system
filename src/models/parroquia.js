const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Parroquia extends Model {}

Parroquia.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    town_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'towns',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(250),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Parroquia',
    tableName: 'parroquias',
    timestamps: false
});

module.exports = Parroquia;
