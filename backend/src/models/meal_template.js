const { DataTypes } = require('sequelize');

/**
 * MealTemplate model - represents a recipe or a reusable meal unit
 */
module.exports = (sequelize) => {
    const MealTemplate = sequelize.define('MealTemplate', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        householdId: {
            type: DataTypes.UUID,
            allowNull: true, // Optional for global templates, required for household-specific
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
        baseServings: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
        createdById: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        // Strategic Roadmap Phase 1 Fields
        instructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        prepTime: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: true,
        },
        cookTime: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: true,
        },
        difficulty: {
            type: DataTypes.ENUM('Easy', 'Medium', 'Hard', 'Expert'),
            defaultValue: 'Medium',
        },
        tags: {
            type: DataTypes.JSON, // e.g. ["quick", "freezer-friendly", "low-carb"]
            defaultValue: [],
        },
        leftoverScore: {
            type: DataTypes.INTEGER, // 1-10 scale of reuse potential
            defaultValue: 5,
        },
        costEstimate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
    }, {
        tableName: 'meal_templates',
        timestamps: true,
        underscored: true,
    });

    MealTemplate.associate = (models) => {
        MealTemplate.belongsTo(models.User, {
            foreignKey: 'createdById',
            as: 'creator',
        });
        MealTemplate.belongsTo(models.Household, {
            foreignKey: 'householdId',
            as: 'household',
        });
        MealTemplate.hasMany(models.MealIngredient, {
            foreignKey: 'mealTemplateId',
            as: 'ingredients',
        });
        MealTemplate.hasMany(models.MealLog, {
            foreignKey: 'mealTemplateId',
            as: 'logs',
        });
    };

    return MealTemplate;
};
