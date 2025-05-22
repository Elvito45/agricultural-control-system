const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Farm extends Model {}

Farm.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    sealImage: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser null si aún no se ha subido
    },
    sealHash: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser null si aún no se ha subido
    }
}, {
    sequelize,
    modelName: 'Farm',
    tableName: 'farms',
    timestamps: true
});

module.exports = Farm;