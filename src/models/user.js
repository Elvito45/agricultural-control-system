const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Owner extends Model {}

Owner.init({
    id: {
        type: DataTypes.STRING(8),
        primaryKey: true
    },
    names: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    surnames: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    photo_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Owner',
    tableName: 'owners',
    timestamps: false
});

module.exports = Owner;