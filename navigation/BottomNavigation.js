import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import Setting from '../screens/Setting';

const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Hjem" component={HomeScreen} />
      <Tab.Screen name="Statistik" component={StatsScreen} />
      <Tab.Screen name="Setting" component={Setting} />
    </Tab.Navigator>
  );
};

export default BottomNavigation;
