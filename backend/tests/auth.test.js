'use strict';

const { sequelize, User, Role, UserHousehold, Household } = require('../src/models');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create default roles
    await Role.create({
      name: 'admin',
      description: 'Household administrator',
      permissions: {
        manage_users: true,
        manage_inventory: true,
        manage_settings: true,
        view_analytics: true
      }
    });

    await Role.create({
      name: 'member',
      description: 'Household member',
      permissions: {
        manage_inventory: true,
        view_analytics: true
      }
    });

    await Role.create({
      name: 'viewer',
      description: 'Read-only access',
      permissions: {
        view_analytics: true
      }
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
    await Household.destroy({ where: {}, force: true });
    await UserHousehold.destroy({ where: {}, force: true });
  });

  describe('User Creation and Authentication', () => {
    it('should create a user with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = await User.create(userData);

      expect(user).toBeTruthy();
      expect(user.email).toEqual(userData.email);
      expect(user.firstName).toEqual(userData.firstName);
      expect(user.lastName).toEqual(userData.lastName);
      expect(user.isActive).toBe(true);
      expect(user.id).toBeTruthy();
    });

    it('should not create a user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      try {
        await User.create(userData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.errors[0].message).toContain('email');
      }
    });

    it('should not create a user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await User.create(userData);

      try {
        await User.create({
          ...userData,
          firstName: 'Jane'
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('Validation error');
      }
    });
  });

  describe('Multi-Household Association', () => {
    let user, household1, household2, adminRole, memberRole;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
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

    it('should allow user to belong to multiple households', async () => {
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

      const userWithHouseholds = await User.findByPk(user.id, {
        include: [{
          association: 'households',
          through: {
            attributes: ['roleId']
          }
        }]
      });

      expect(userWithHouseholds.households).toHaveLength(2);
      expect(userWithHouseholds.households.map(h => h.id)).toContain(household1.id);
      expect(userWithHouseholds.households.map(h => h.id)).toContain(household2.id);
    });

    it('should check household access correctly', async () => {
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

    it('should get user role in household correctly', async () => {
      await UserHousehold.create({
        userId: user.id,
        householdId: household1.id,
        roleId: adminRole.id
      });

      const role = await user.getRoleInHousehold(household1.id);

      expect(role).toBeTruthy();
      expect(role.name).toEqual('admin');
    });

    it('should prevent duplicate user-household associations', async () => {
      await UserHousehold.create({
        userId: user.id,
        householdId: household1.id,
        roleId: adminRole.id
      });

      try {
        await UserHousehold.create({
          userId: user.id,
          householdId: household1.id,
          roleId: memberRole.id
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('Validation error');
      }
    });
  });

  describe('Role-Based Access Control', () => {
    let user, household, adminRole, memberRole, viewerRole;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      household = await Household.create({
        name: 'Test Household',
        timezone: 'UTC',
        currency: 'USD'
      });

      adminRole = await Role.findOne({ where: { name: 'admin' } });
      memberRole = await Role.findOne({ where: { name: 'member' } });
      viewerRole = await Role.findOne({ where: { name: 'viewer' } });
    });

    it('should grant admin permissions correctly', async () => {
      await UserHousehold.create({
        userId: user.id,
        householdId: household.id,
        roleId: adminRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: {
          userId: user.id,
          householdId: household.id
        },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      const canManageUsers = await userHousehold.hasPermission('manage_users');
      const canManageInventory = await userHousehold.hasPermission('manage_inventory');
      const canManageSettings = await userHousehold.hasPermission('manage_settings');
      const canViewAnalytics = await userHousehold.hasPermission('view_analytics');

      expect(canManageUsers).toBe(true);
      expect(canManageInventory).toBe(true);
      expect(canManageSettings).toBe(true);
      expect(canViewAnalytics).toBe(true);
    });

    it('should grant member permissions correctly', async () => {
      await UserHousehold.create({
        userId: user.id,
        householdId: household.id,
        roleId: memberRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: {
          userId: user.id,
          householdId: household.id
        },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      const canManageUsers = await userHousehold.hasPermission('manage_users');
      const canManageInventory = await userHousehold.hasPermission('manage_inventory');
      const canManageSettings = await userHousehold.hasPermission('manage_settings');
      const canViewAnalytics = await userHousehold.hasPermission('view_analytics');

      expect(canManageUsers).toBe(false);
      expect(canManageInventory).toBe(true);
      expect(canManageSettings).toBe(false);
      expect(canViewAnalytics).toBe(true);
    });

    it('should grant viewer permissions correctly', async () => {
      await UserHousehold.create({
        userId: user.id,
        householdId: household.id,
        roleId: viewerRole.id
      });

      const userHousehold = await UserHousehold.findOne({
        where: {
          userId: user.id,
          householdId: household.id
        },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      const canManageUsers = await userHousehold.hasPermission('manage_users');
      const canManageInventory = await userHousehold.hasPermission('manage_inventory');
      const canManageSettings = await userHousehold.hasPermission('manage_settings');
      const canViewAnalytics = await userHousehold.hasPermission('view_analytics');

      expect(canManageUsers).toBe(false);
      expect(canManageInventory).toBe(false);
      expect(canManageSettings).toBe(false);
      expect(canViewAnalytics).toBe(true);
    });
  });

  describe('User Status Management', () => {
    it('should deactivate user account', async () => {
      const user = await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.update({ isActive: false });

      const deactivatedUser = await User.findByPk(user.id);
      expect(deactivatedUser.isActive).toBe(false);
    });

    it('should update last login timestamp', async () => {
      const user = await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      const loginTime = new Date();
      await user.update({ lastLoginAt: loginTime });

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.lastLoginAt).toBeInstanceOf(Date);
      expect(updatedUser.lastLoginAt.getTime()).toEqual(loginTime.getTime());
    });
  });
});
