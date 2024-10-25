import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/Setting';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Hjem" component={HomeScreen} />
      <Tab.Screen name="Statistik" component={StatsScreen} />
      <Tab.Screen name="Historik" component={HistoryScreen} />
      <Tab.Screen name="Indstillinger" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavigation;
