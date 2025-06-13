const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const State = require('./state');
const Town = require('./town');
const Livestock = require('./livestock');
const Parroquia = require('./parroquia');

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
    parroquia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'parroquias',
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

// Asociaciones
Farm.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
Farm.belongsTo(Town, { foreignKey: 'town_id', as: 'town' });
Farm.belongsTo(Parroquia, { foreignKey: 'parroquia_id', as: 'parroquia' });
Farm.hasMany(Livestock, { foreignKey: 'farm_id', as: 'livestock' });

module.exports = Farm;