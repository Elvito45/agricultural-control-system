const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Livestock extends Model {}

Livestock.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    farm_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'farms',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    seal_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    seal_hash: {
        type: DataTypes.STRING(128),
        allowNull: true,
        unique: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Livestock',
    tableName: 'livestock',
    timestamps: false
});

module.exports = Livestock;