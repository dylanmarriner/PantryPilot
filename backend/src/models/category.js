const { DataTypes } = require('sequelize');

/**
 * Category model - groups items for easier organization
 */
module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        household_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'households',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        tableName: 'categories',
        timestamps: true,
        underscored: true,
    });

    Category.associate = (models) => {
        Category.belongsTo(models.Household, {
            foreignKey: 'household_id',
            as: 'household',
        });
        Category.hasMany(models.Item, {
            foreignKey: 'category_id',
            as: 'items',
        });
    };

    return Category;
};
