import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Package,
  PlusCircle,
  ChefHat,
  ShoppingCart,
  Wallet,
  BarChart3
} from 'lucide-react-native';
import { useAuth } from '../services/auth';
import { Theme } from '../styles/DesignSystem';

import AuthScreen from '../screens/AuthScreen';
import HouseholdManagerScreen from '../screens/HouseholdManagerScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import AddItemScreen from '../screens/AddItemScreen';
import LogTodayScreen from '../screens/LogTodayScreen';
import LunchPlannerScreen from '../screens/LunchPlannerScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import BudgetOverviewScreen from '../screens/BudgetOverviewScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import FeatureFlagManagerScreen from '../screens/FeatureFlagManagerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComp = Home;
          if (route.name === 'Dashboard') IconComp = Home;
          else if (route.name === 'Inventory') IconComp = Package;
          else if (route.name === 'LogToday') IconComp = PlusCircle;
          else if (route.name === 'Planner') IconComp = ChefHat;
          else if (route.name === 'Groceries') IconComp = ShoppingCart;
          else if (route.name === 'Budget') IconComp = Wallet;
          else if (route.name === 'Stats') IconComp = BarChart3;
          return <IconComp size={20} color={color} />;
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.text.dimmed,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(5, 5, 5, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          paddingTop: 5,
          height: 60,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="LogToday" component={LogTodayScreen} />
      <Tab.Screen name="Planner" component={LunchPlannerScreen} />
      <Tab.Screen name="Groceries" component={GroceryListScreen} />
      <Tab.Screen name="Budget" component={BudgetOverviewScreen} />
      <Tab.Screen name="Stats" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#050505' } }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="HouseholdManager" component={HouseholdManagerScreen} />
          <Stack.Screen
            name="AddItem"
            component={AddItemScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="FeatureFlagManager" component={FeatureFlagManagerScreen} />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
