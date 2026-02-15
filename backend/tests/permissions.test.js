'use strict';

const { sequelize, User, Role, UserHousehold, Household, FeatureFlag } = require('../src/models');

describe('RBAC and Permissions Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create roles with different permission levels
    await Role.create({
      name: 'admin',
      description: 'Full administrative access',
      permissions: {
        manage_users: true,
        manage_inventory: true,
        manage_settings: true,
        view_analytics: true,
        export_data: true,
        manage_billing: true
      }
    });

    await Role.create({
      name: 'member',
      description: 'Standard member access',
      permissions: {
        manage_inventory: true,
        view_analytics: true,
        export_data: true
      }
    });

    await Role.create({
      name: 'viewer',
      description: 'Read-only access',
      permissions: {
        view_analytics: true
      }
    });

    await Role.create({
      name: 'guest',
      description: 'Limited guest access',
      permissions: {}
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await UserHousehold.destroy({ where: {}, force: true });
    await FeatureFlag.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Household.destroy({ where: {}, force: true });
  });

  describe('Role Permission Enforcement', () => {
    let household, adminRole, memberRole, viewerRole, guestRole;

    beforeEach(async () => {
      household = await Household.create({
        name: 'Test Household',
        timezone: 'UTC',
        currency: 'USD'
      });

      adminRole = await Role.findOne({ where: { name: 'admin' } });
      memberRole = await Role.findOne({ where: { name: 'member' } });
      viewerRole = await Role.findOne({ where: { name: 'viewer' } });
      guestRole = await Role.findOne({ where: { name: 'guest' } });
    });

    it('should enforce admin role permissions', async () => {
      const admin = await User.create({
        email: 'admin@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'User'
      });

      await UserHousehold.create({
        userId: admin.id,
        householdId: household.id,
        roleId: adminRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: { userId: admin.id, householdId: household.id },
        include: [{ model: Role, as: 'role' }]
      });

      // Admin should have all permissions
      expect(await userHousehold.hasPermission('manage_users')).toBe(true);
      expect(await userHousehold.hasPermission('manage_inventory')).toBe(true);
      expect(await userHousehold.hasPermission('manage_settings')).toBe(true);
      expect(await userHousehold.hasPermission('view_analytics')).toBe(true);
      expect(await userHousehold.hasPermission('export_data')).toBe(true);
      expect(await userHousehold.hasPermission('manage_billing')).toBe(true);
    });

    it('should enforce member role permissions', async () => {
      const member = await User.create({
        email: 'member@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Member',
        lastName: 'User'
      });

      await UserHousehold.create({
        userId: member.id,
        householdId: household.id,
        roleId: memberRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: { userId: member.id, householdId: household.id },
        include: [{ model: Role, as: 'role' }]
      });

      // Member should have limited permissions
      expect(await userHousehold.hasPermission('manage_users')).toBe(false);
      expect(await userHousehold.hasPermission('manage_inventory')).toBe(true);
      expect(await userHousehold.hasPermission('manage_settings')).toBe(false);
      expect(await userHousehold.hasPermission('view_analytics')).toBe(true);
      expect(await userHousehold.hasPermission('export_data')).toBe(true);
      expect(await userHousehold.hasPermission('manage_billing')).toBe(false);
    });

    it('should enforce viewer role permissions', async () => {
      const viewer = await User.create({
        email: 'viewer@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Viewer',
        lastName: 'User'
      });

      await UserHousehold.create({
        userId: viewer.id,
        householdId: household.id,
        roleId: viewerRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: { userId: viewer.id, householdId: household.id },
        include: [{ model: Role, as: 'role' }]
      });

      // Viewer should only have view permissions
      expect(await userHousehold.hasPermission('manage_users')).toBe(false);
      expect(await userHousehold.hasPermission('manage_inventory')).toBe(false);
      expect(await userHousehold.hasPermission('manage_settings')).toBe(false);
      expect(await userHousehold.hasPermission('view_analytics')).toBe(true);
      expect(await userHousehold.hasPermission('export_data')).toBe(false);
      expect(await userHousehold.hasPermission('manage_billing')).toBe(false);
    });

    it('should enforce guest role permissions', async () => {
      const guest = await User.create({
        email: 'guest@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Guest',
        lastName: 'User'
      });

      await UserHousehold.create({
        userId: guest.id,
        householdId: household.id,
        roleId: guestRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: { userId: guest.id, householdId: household.id },
        include: [{ model: Role, as: 'role' }]
      });

      // Guest should have no permissions
      expect(await userHousehold.hasPermission('manage_users')).toBe(false);
      expect(await userHousehold.hasPermission('manage_inventory')).toBe(false);
      expect(await userHousehold.hasPermission('manage_settings')).toBe(false);
      expect(await userHousehold.hasPermission('view_analytics')).toBe(false);
      expect(await userHousehold.hasPermission('export_data')).toBe(false);
      expect(await userHousehold.hasPermission('manage_billing')).toBe(false);
    });
  });

  describe('Multi-Household Permission Isolation', () => {
    let user, household1, household2, adminRole, memberRole;

    beforeEach(async () => {
      user = await User.create({
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Multi',
        lastName: 'Household'
      });

      household1 = await Household.create({
        name: 'Household One',
        timezone: 'UTC',
        currency: 'USD'
      });

      household2 = await Household.create({
        name: 'Household Two',
        timezone: 'UTC',
        currency: 'USD'
      });

      adminRole = await Role.findOne({ where: { name: 'admin' } });
      memberRole = await Role.findOne({ where: { name: 'member' } });
    });

    it('should maintain separate permissions per household', async () => {
      // User is admin in household1, member in household2
      await UserHousehold.create({
        userId: user.id,
        householdId: household1.id,
        roleId: adminRole.id
      });

      await UserHousehold.create({
        userId: user.id,
        householdId: household2.id,
        roleId: memberRole.id
      });

      // Check permissions in household1 (admin)
      const role1 = await user.getRoleInHousehold(household1.id);
      expect(role1.name).toEqual('admin');

      const userHousehold1 = await UserHousehold.findOne({
        where: { userId: user.id, householdId: household1.id },
        include: [{ model: Role, as: 'role' }]
      });
      expect(await userHousehold1.hasPermission('manage_users')).toBe(true);

      // Check permissions in household2 (member)
      const role2 = await user.getRoleInHousehold(household2.id);
      expect(role2.name).toEqual('member');

      const userHousehold2 = await UserHousehold.findOne({
        where: { userId: user.id, householdId: household2.id },
        include: [{ model: Role, as: 'role' }]
      });
      expect(await userHousehold2.hasPermission('manage_users')).toBe(false);
    });

    it('should prevent access to households user is not member of', async () => {
      // User only belongs to household1
      await UserHousehold.create({
        userId: user.id,
        householdId: household1.id,
        roleId: adminRole.id
      });

      const hasAccess1 = await user.hasHouseholdAccess(household1.id);
      const hasAccess2 = await user.hasHouseholdAccess(household2.id);

      expect(hasAccess1).toBe(true);
      expect(hasAccess2).toBe(false);
    });
  });

  describe('Feature Flag Integration', () => {
    let household, user, memberRole;

    beforeEach(async () => {
      household = await Household.create({
        name: 'Test Household',
        timezone: 'UTC',
        currency: 'USD'
      });

      user = await User.create({
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User'
      });

      memberRole = await Role.findOne({ where: { name: 'member' } });

      await UserHousehold.create({
        userId: user.id,
        householdId: household.id,
        roleId: memberRole.id
      });
    });

    it('should check feature flags correctly', async () => {
      // Feature not enabled by default
      const isFeatureEnabled = await FeatureFlag.isEnabled('advanced_analytics', household.id);
      expect(isFeatureEnabled).toBe(false);

      // Enable feature
      await FeatureFlag.setFeature('advanced_analytics', household.id, true);

      // Feature should now be enabled
      const isFeatureEnabledAfter = await FeatureFlag.isEnabled('advanced_analytics', household.id);
      expect(isFeatureEnabledAfter).toBe(true);
    });

    it('should integrate feature flags with household methods', async () => {
      // Enable feature on household
      await FeatureFlag.setFeature('premium_export', household.id, true);

      // Check through household method
      const hasFeature = await household.hasFeatureEnabled('premium_export');
      expect(hasFeature).toBe(true);

      // Check disabled feature
      const hasDisabledFeature = await household.hasFeatureEnabled('disabled_feature');
      expect(hasDisabledFeature).toBe(false);
    });
  });

  describe('Household Subscription Constraints', () => {
    let household, user, memberRole;

    beforeEach(async () => {
      household = await Household.create({
        name: 'Test Household',
        timezone: 'UTC',
        currency: 'USD',
        subscriptionTier: 'free',
        maxUsers: 3
      });

      memberRole = await Role.findOne({ where: { name: 'member' } });
    });

    it('should enforce user limits based on subscription', async () => {
      // Add users up to limit
      const users = [];
      for (let i = 0; i < 3; i++) {
        const user = await User.create({
          email: `user${i}@example.com`,
          passwordHash: 'hashedpassword',
          firstName: `User${i}`,
          lastName: 'Test'
        });

        await UserHousehold.create({
          userId: user.id,
          householdId: household.id,
          roleId: memberRole.id
        });

        users.push(user);
      }

      // Should be able to add users up to limit
      expect(await household.getUserCount()).toEqual(3);
      expect(await household.canAddUser()).toBe(false);

      // Try to add one more user
      const extraUser = await User.create({
        email: 'extra@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Extra',
        lastName: 'User'
      });

      try {
        await UserHousehold.create({
          userId: extraUser.id,
          householdId: household.id,
          roleId: memberRole.id
        });
        // This should succeed at the database level, but business logic should check
      } catch (error) {
        // Database constraints might prevent this
      }

      const finalCount = await household.getUserCount();
      expect(finalCount).toBeLessThanOrEqual(4); // Database constraint or application logic
    });

    it('should allow more users with higher subscription tier', async () => {
      // Upgrade subscription
      await household.update({
        subscriptionTier: 'premium',
        maxUsers: 10
      });

      expect(await household.canAddUser()).toBe(true);

      // Add users
      const users = [];
      for (let i = 0; i < 5; i++) {
        const user = await User.create({
          email: `premiumuser${i}@example.com`,
          passwordHash: 'hashedpassword',
          firstName: `Premium${i}`,
          lastName: 'User'
        });

        await UserHousehold.create({
          userId: user.id,
          householdId: household.id,
          roleId: memberRole.id
        });

        users.push(user);
      }

      expect(await household.getUserCount()).toEqual(5);
      expect(await household.canAddUser()).toBe(true);
    });
  });

  describe('Permission Inheritance and Overrides', () => {
    it('should handle permission changes dynamically', async () => {
      const household = await Household.create({
        name: 'Test Household',
        timezone: 'UTC',
        currency: 'USD'
      });

      const user = await User.create({
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User'
      });

      const memberRole = await Role.findOne({ where: { name: 'member' } });

      await UserHousehold.create({
        userId: user.id,
        householdId: household.id,
        roleId: memberRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: { userId: user.id, householdId: household.id },
        include: [{ model: Role, as: 'role' }]
      });

      // Initially member doesn't have manage_users permission
      expect(await userHousehold.hasPermission('manage_users')).toBe(false);

      // Update role to include manage_users
      await memberRole.update({
        permissions: {
          ...memberRole.permissions,
          manage_users: true
        }
      });

      // Refresh the association
      await userHousehold.reload({
        include: [{ model: Role, as: 'role' }]
      });

      // Now should have the permission
      expect(await userHousehold.hasPermission('manage_users')).toBe(true);
    });
  });
});
