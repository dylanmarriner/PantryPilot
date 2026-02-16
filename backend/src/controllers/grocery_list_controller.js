const { ShoppingItem } = require('../models');

class GroceryListController {
    async getList(req, res) {
        try {
            const items = await ShoppingItem.findAll({
                order: [['is_purchased', 'ASC'], ['createdAt', 'DESC']]
            });

            // Transform for frontend if needed, or return as is
            res.json(items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                priority: item.priority,
                purchased: item.is_purchased
            })));
        } catch (error) {
            console.error('Error fetching grocery list:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async addItem(req, res) {
        try {
            const { name, quantity, unit, category, priority, source } = req.body;

            const newItem = await ShoppingItem.create({
                name,
                quantity: quantity || 1,
                unit: unit || 'pc',
                category: category || 'GENERAL',
                priority: priority || 'medium',
                source: source || 'manual',
                is_purchased: false
            });

            res.status(201).json(newItem);
        } catch (error) {
            console.error('Error adding grocery item:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Map frontend 'purchased' to backend 'is_purchased'
            if (updates.purchased !== undefined) {
                updates.is_purchased = updates.purchased;
                delete updates.purchased;
            }

            const [updated] = await ShoppingItem.update(updates, {
                where: { id }
            });

            if (updated) {
                const updatedItem = await ShoppingItem.findByPk(id);
                res.json(updatedItem);
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            console.error('Error updating grocery item:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async generateList(req, res) {
        // Placeholder for future AI generation logic
        // For now, just return current list
        return this.getList(req, res);
    }
}

module.exports = new GroceryListController();
