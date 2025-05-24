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
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    owner_id: {
        type: DataTypes.STRING(8),
        allowNull: false,
        references: {
            model: 'owners',
            key: 'id'
        }
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'states',
            key: 'id'
        }
    },
    town_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'towns',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    maps_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10,8),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(11,8),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Farm',
    tableName: 'farms',
    timestamps: false
});

module.exports = Farm;