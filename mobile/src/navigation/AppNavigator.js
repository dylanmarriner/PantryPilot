import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../services/auth';

import AuthScreen from '../screens/AuthScreen';
import HouseholdManagerScreen from '../screens/HouseholdManagerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import AddItemScreen from '../screens/AddItemScreen';
import LogTodayScreen from '../screens/LogTodayScreen';
import LunchPlannerScreen from '../screens/LunchPlannerScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import BudgetOverviewScreen from '../screens/BudgetOverviewScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Inventory') {
            iconName = 'inventory';
          } else if (route.name === 'LogToday') {
            iconName = 'add-shopping-cart';
          } else if (route.name === 'LunchPlanner') {
            iconName = 'restaurant-menu';
          } else if (route.name === 'GroceryList') {
            iconName = 'list';
          } else if (route.name === 'Budget') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Analytics') {
            iconName = 'analytics';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="LogToday" component={LogTodayScreen} />
      <Tab.Screen name="LunchPlanner" component={LunchPlannerScreen} />
      <Tab.Screen name="GroceryList" component={GroceryListScreen} />
      <Tab.Screen name="Budget" component={BudgetOverviewScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="HouseholdManager" component={HouseholdManagerScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="AddItem"
            component={AddItemScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{ presentation: 'card' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
