const aiService = require("../services/ai_service");
const visionService = require("../services/vision_service");

class AIController {
  async processText(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const actions = await aiService.extractActions(text);
      res.json({ actions });
    } catch (error) {
      console.error("Error processing text:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getSuggestions(req, res) {
    try {
      const { inventory } = req.body;

      if (!inventory) {
        return res.status(400).json({ error: "Inventory data is required" });
      }

      const suggestions = await aiService.generateSuggestions(inventory);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async scanImage(req, res) {
    try {
      const { barcode } = req.body;
      const image = req.file;

      if (barcode) {
        const product = await visionService.identifyByBarcode(barcode);
        return res.json(product);
      }

      if (image) {
        // Handle photo OCR
        const result = await visionService.processPhotoOCR(image.path);
        return res.json(result);
      }

      return res
        .status(400)
        .json({ error: "Barcode or image file is required" });
    } catch (error) {
      console.error("Error scanning image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async generateWeeklyPlan(req, res) {
    try {
      const { householdId } = req.body;
      let { inventory } = req.body;

      // Lazy load models to avoid circular deps if any
      const {
        MealTemplate,
        KidProfile,
        MealIngredient,
        RotationLog,
      } = require("../models");
      const InventoryService = require("../services/inventory");
      const inventoryService = new InventoryService();

      // Fetch inventory scoped to the household
      if (!inventory) {
        const { Item } = require("../models");
        const whereClause = householdId ? { household_id: householdId } : {};
        const items = await Item.findAll({ where: whereClause });
        inventory = {};

        for (const item of items) {
          const qty = await inventoryService.getCurrentStock(item.id);
          if (qty > 0) {
            inventory[item.id] = {
              name: item.name,
              quantity: qty,
              expiryDate: null,
            };
          }
        }
      }

      // 1. Fetch Data
      const kidProfiles = await KidProfile.findAll({
        where: { household_id: householdId },
      });
      const rotationLogs = await RotationLog.findAll();
      const allMeals = await MealTemplate.findAll({
        include: [{ model: MealIngredient, as: "ingredients" }],
      });

      // 2. Score Meals (Dinner)
      const scoredMeals = [];
      for (const meal of allMeals) {
        const score = await aiService.calculateMealScore(
          meal,
          inventory,
          kidProfiles,
        );
        const missingIngredients = aiService.getMissingIngredients(
          meal,
          inventory,
        );

        let finalScore = score;
        if (missingIngredients.length === 1 && score > 0.6) {
          finalScore += 0.1;
        }

        scoredMeals.push({
          ...meal.toJSON(),
          score: finalScore,
          missingIngredients,
        });
      }
      scoredMeals.sort((a, b) => b.score - a.score);

      // 3. Selection Logic (Simplified for MVP)
      const { budget } = req.body;
      const weeklyBudget = budget || Infinity;
      const selectedDinners = [];
      let currentCost = 0;

      for (const meal of scoredMeals) {
        const cost = parseFloat(meal.cost_estimate) || 15.0;
        if (selectedDinners.length < 7 && currentCost + cost <= weeklyBudget) {
          selectedDinners.push(meal);
          currentCost += cost;
        }
      }

      // 4. Generate Lunch Suggestions
      const lunchTemplates = [];
      for (const kid of kidProfiles) {
        const kidLogs = rotationLogs.filter(
          (log) => log.kid_profile_id === kid.id,
        );
        const suggestions = await aiService.generateLunchSuggestions(
          inventory,
          kid,
          kidLogs,
        );

        lunchTemplates.push({
          kidName: kid.name,
          kidId: kid.id,
          suggestions,
        });
      }

      // 5. Generate Structure
      const weeklyPlan = {
        metadata: {
          budgetLimit: weeklyBudget === Infinity ? "UNLIMITED" : weeklyBudget,
          totalEstCost: currentCost,
          planScore:
            selectedDinners.reduce((acc, m) => acc + m.score, 0) /
            (selectedDinners.length || 1),
        },
        dinners: selectedDinners,
        lunches: {
          generated_at: new Date(),
          slots: ["Main", "Fruit", "Snack", "Treat", "Drink"],
          templates: lunchTemplates,
        },
      };

      res.json({ success: true, plan: weeklyPlan });
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new AIController();
