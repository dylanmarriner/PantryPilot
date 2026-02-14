const { sequelize, MealTemplate, MealIngredient, MealLog, Item, StockEntry } = require('../models');
const { Op } = require('sequelize');

class MealService {
  async createMealTemplate(templateData, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const template = await MealTemplate.create({
        ...templateData,
        createdById: userId
      }, { transaction });

      if (templateData.ingredients && templateData.ingredients.length > 0) {
        const ingredients = templateData.ingredients.map(ing => ({
          ...ing,
          mealTemplateId: template.id
        }));
        
        await MealIngredient.bulkCreate(ingredients, { transaction });
      }

      await transaction.commit();
      return template;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async calculateMealCost(mealTemplateId, servings = 1) {
    const template = await MealTemplate.findByPk(mealTemplateId, {
      include: [{
        model: MealIngredient,
        as: 'ingredients',
        include: [{
          model: Item,
          as: 'ingredient',
          include: [{
            model: StockEntry,
            as: 'stockEntries',
            where: {
              quantity_base: { [Op.gt]: 0 },
              expiry_date: { [Op.gte]: new Date() }
            },
            required: false,
            order: [['purchase_price_cents', 'ASC']]
          }]
        }]
      }]
    });

    if (!template) {
      throw new Error('Meal template not found');
    }

    let totalCost = 0;
    let totalCostCents = 0;
    const unavailableIngredients = [];

    for (const ingredient of template.ingredients) {
      const requiredQuantity = ingredient.quantity * (servings / template.baseServings);
      const availableStock = ingredient.ingredient.stockEntries;
      
      if (availableStock.length === 0) {
        unavailableIngredients.push(ingredient.ingredient.name);
        continue;
      }

      let remainingQuantity = requiredQuantity;
      let ingredientCostCents = 0;

      for (const stock of availableStock) {
        if (remainingQuantity <= 0) break;
        
        const useQuantity = Math.min(remainingQuantity, stock.quantity_base);
        if (stock.purchase_price_cents) {
          const pricePerBaseUnit = stock.purchase_price_cents / stock.quantity_base;
          ingredientCostCents += Math.round(useQuantity * pricePerBaseUnit);
        }
        remainingQuantity -= useQuantity;
      }

      if (remainingQuantity > 0) {
        unavailableIngredients.push(ingredient.ingredient.name);
      }

      totalCostCents += ingredientCostCents;
    }

    totalCost = totalCostCents / 100;

    return {
      totalCost: totalCost.toFixed(2),
      unavailableIngredients,
      canPrepare: unavailableIngredients.length === 0
    };
  }

  async logMealExecution(mealLogData) {
    const transaction = await sequelize.transaction();
    
    try {
      const costCalculation = await this.calculateMealCost(
        mealLogData.mealTemplateId,
        mealLogData.servingsMade
      );

      if (!costCalculation.canPrepare) {
        throw new Error(`Insufficient ingredients: ${costCalculation.unavailableIngredients.join(', ')}`);
      }

      const mealLog = await MealLog.create({
        ...mealLogData,
        actualCost: costCalculation.totalCost
      }, { transaction });

      const template = await MealTemplate.findByPk(mealLogData.mealTemplateId, {
        include: [{
          model: MealIngredient,
          as: 'ingredients',
          include: [{
            model: Item,
            as: 'ingredient',
            include: [{
              model: StockEntry,
              as: 'stockEntries',
              where: {
                quantity_base: { [Op.gt]: 0 },
                expiry_date: { [Op.gte]: new Date() }
              },
              required: false,
              order: [['purchase_price_cents', 'ASC']]
            }]
          }]
        }]
      });

      for (const ingredient of template.ingredients) {
        const requiredQuantity = ingredient.quantity * (mealLogData.servingsMade / template.baseServings);
        const availableStock = ingredient.ingredient.stockEntries;
        
        let remainingQuantity = requiredQuantity;

        for (const stock of availableStock) {
          if (remainingQuantity <= 0) break;
          
          const useQuantity = Math.min(remainingQuantity, stock.quantity_base);
          
          await stock.update({
            quantity_base: stock.quantity_base - useQuantity
          }, { transaction });

          remainingQuantity -= useQuantity;
        }

        if (remainingQuantity > 0) {
          throw new Error(`Insufficient stock for ingredient: ${ingredient.ingredient.name}`);
        }
      }

      await transaction.commit();
      return mealLog;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getMealTemplates(userId = null) {
    const whereClause = userId ? { createdById: userId } : {};
    
    return await MealTemplate.findAll({
      where: whereClause,
      include: [{
        model: MealIngredient,
        as: 'ingredients',
        include: [{
          model: Item,
          as: 'ingredient'
        }]
      }],
      order: [['created_at', 'DESC']]
    });
  }

  async getMealLogs(userId, limit = 50) {
    return await MealLog.findAll({
      where: { userId },
      include: [{
        model: MealTemplate,
        as: 'mealTemplate'
      }],
      limit,
      order: [['mealDate', 'DESC']]
    });
  }

  async suggestSubstitutions(ingredientId, requiredQuantity) {
    const ingredient = await Item.findByPk(ingredientId);
    if (!ingredient) {
      throw new Error('Ingredient not found');
    }

    const substitutes = await Item.findAll({
      where: {
        id: { [Op.ne]: ingredientId },
        category_id: ingredient.category_id
      },
      include: [{
        model: StockEntry,
        as: 'stockEntries',
        where: {
          quantity_base: { [Op.gte]: requiredQuantity },
          expiry_date: { [Op.gte]: new Date() }
        },
        required: true
      }]
    });

    return substitutes.map(sub => ({
      ingredient: sub,
      availableQuantity: sub.stockEntries.reduce((sum, stock) => sum + stock.quantity_base, 0),
      averagePrice: sub.stockEntries.reduce((sum, stock) => sum + (stock.purchase_price_cents || 0), 0) / sub.stockEntries.length / 100
    }));
  }
}

module.exports = new MealService();
