const { User, UserHousehold, Household } = require('../models');

class UsersController {
  /**
   * Get user's households
   */
  async getUserHouseholds(req, res) {
    try {
      const { userId } = req.params;
      const authenticatedUserId = req.user.id;

      // Only allow users to view their own households
      if (userId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userHouseholds = await UserHousehold.findAll({
        where: {
          userId: userId
        },
        include: [
          {
            model: Household,
            as: 'household',
            attributes: ['id', 'name', 'address']
          },
          {
            model: require('../models').Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      const households = userHouseholds.map(uh => ({
        id: uh.household.id,
        name: uh.household.name,
        address: uh.household.address,
        role: uh.role.name,
        joinedAt: uh.createdAt
      }));

      res.json({
        success: true,
        data: households
      });
    } catch (error) {
      console.error('Failed to get user households:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get households',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new UsersController();
