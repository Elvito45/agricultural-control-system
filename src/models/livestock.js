exports.Livestock = (sequelize, DataTypes) => {
    const Livestock = sequelize.define('Livestock', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sealImage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        farmId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Farms',
                key: 'id'
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    return Livestock;
};