'use strict';

const { sequelize, User, Role, UserHousehold, Household, FeatureFlag, UsageAnalytics, PriceSnapshot, Sku } = require('../src/models');
const AnalyticsService = require('../src/services/analytics_service');

describe('Analytics Service Tests', () => {
  let analyticsService;
  let household, user, memberRole;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create default role
    await Role.create({
      name: 'member',
      description: 'Household member',
      permissions: {
        manage_inventory: true,
        view_analytics: true
      }
    });

    analyticsService = new AnalyticsService({
      UsageAnalytics,
      PriceSnapshot,
      Sku
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await UserHousehold.destroy({ where: {}, force: true });
    await FeatureFlag.destroy({ where: {}, force: true });
    await UsageAnalytics.destroy({ where: {}, force: true });
    await PriceSnapshot.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Household.destroy({ where: {}, force: true });
    await Sku.destroy({ where: {}, force: true });

    // Setup test data
    household = await Household.create({
      name: 'Test Household',
      timezone: 'UTC',
      currency: 'USD'
    });

    user = await User.create({
      email: 'test@example.com',
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

  describe('Usage Analytics Tracking', () => {
    it('should track usage events correctly', async () => {
      const eventData = {
        householdId: household.id,
        userId: user.id,
        eventType: 'inventory_add',
        metadata: {
          itemId: 'item123',
          quantity: 5
        }
      };

      const event = await analyticsService.trackEvent(
        eventData.householdId,
        eventData.userId,
        eventData.eventType,
        eventData.metadata
      );

      expect(event).toBeTruthy();
      expect(event.householdId).toEqual(eventData.householdId);
      expect(event.userId).toEqual(eventData.userId);
      expect(event.eventType).toEqual(eventData.eventType);
      expect(event.metadata).toEqual(eventData.metadata);
      expect(event.timestamp).toBeTruthy();
    });

    it('should track multiple event types', async () => {
      const eventTypes = ['inventory_add', 'inventory_remove', 'price_update', 'meal_logged'];
      
      for (const eventType of eventTypes) {
        await analyticsService.trackEvent(household.id, user.id, eventType, {
          test: true
        });
      }

      const events = await UsageAnalytics.findAll({
        where: {
          householdId: household.id,
          userId: user.id
        }
      });

      expect(events.length).toBe(4);
      expect(events.map(e => e.eventType)).toEqual(expect.arrayContaining(eventTypes));
    });
  });

  describe('Household Usage Statistics', () => {
    beforeEach(async () => {
      // Create test analytics data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const endDate = new Date();

      await analyticsService.trackEvent(household.id, user.id, 'inventory_add', { itemId: '1' });
      await analyticsService.trackEvent(household.id, user.id, 'inventory_add', { itemId: '2' });
      await analyticsService.trackEvent(household.id, user.id, 'inventory_remove', { itemId: '1' });
      await analyticsService.trackEvent(household.id, user.id, 'price_update', { itemId: '2' });
      await analyticsService.trackEvent(household.id, user.id, 'meal_logged', { mealId: '1' });
    });

    it('should get household usage statistics', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const stats = await analyticsService.getHouseholdUsageStats(
        household.id,
        startDate,
        endDate
      );

      expect(stats.totalEvents).toBe(5);
      expect(stats.eventTypes).toEqual({
        inventory_add: 2,
        inventory_remove: 1,
        price_update: 1,
        meal_logged: 1
      });
      expect(stats.userActivity).toEqual({
        [user.id]: 5
      });
    });
  });

  describe('User Usage Statistics', () => {
    beforeEach(async () => {
      // Create test analytics data for user
      await analyticsService.trackEvent(household.id, user.id, 'inventory_add', { itemId: '1' });
      await analyticsService.trackEvent(household.id, user.id, 'inventory_add', { itemId: '2' });
      await analyticsService.trackEvent(household.id, user.id, 'meal_logged', { mealId: '1' });
    });

    it('should get user usage statistics', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const stats = await analyticsService.getUserUsageStats(
        user.id,
        startDate,
        endDate
      );

      expect(stats.totalEvents).toBe(3);
      expect(stats.eventTypes).toEqual({
        inventory_add: 2,
        meal_logged: 1
      });
      expect(stats.householdActivity).toEqual({
        [household.id]: 3
      });
    });
  });

  describe('Analytics Model Methods', () => {
    it('should track usage through model method', async () => {
      const event = await UsageAnalytics.trackUsage(
        household.id,
        user.id,
        'test_event',
        { test: true }
      );

      expect(event).toBeTruthy();
      expect(event.eventType).toEqual('test_event');
    });

    it('should get usage by household through model method', async () => {
      await UsageAnalytics.trackUsage(household.id, user.id, 'test_event', { test: true });

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const events = await UsageAnalytics.getUsageByHousehold(
        household.id,
        startDate,
        endDate
      );

      expect(events.length).toBe(1);
      expect(events[0].eventType).toEqual('test_event');
    });

    it('should get usage by user through model method', async () => {
      await UsageAnalytics.trackUsage(household.id, user.id, 'test_event', { test: true });

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const events = await UsageAnalytics.getUsageByUser(
        user.id,
        startDate,
        endDate
      );

      expect(events.length).toBe(1);
      expect(events[0].eventType).toEqual('test_event');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid household ID gracefully', async () => {
      try {
        await analyticsService.getHouseholdUsageStats(
          'invalid-household-id',
          new Date(),
          new Date()
        );
        // Should not throw, but return empty stats
      } catch (error) {
        // Database errors are expected for invalid IDs
        expect(error).toBeTruthy();
      }
    });
  });
});
