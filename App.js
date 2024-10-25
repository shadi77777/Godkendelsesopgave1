import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from './navigation/BottomNavigation'; // Importér din BottomNavigation
import ProfileScreen from './screens/ProfileScreen'; // Importér ProfileScreen
import { initializeFirebase } from './config/firebase'; // Importér din Firebase-initialiseringsfunktion

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Brug en useEffect til at initialisere Firebase kun én gang ved opstart
  useEffect(() => {
    initializeFirebase();
  }, []); // [] betyder, at dette kun kører én gang ved første render

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Bundnavigationen som hovedskærmen */}
        <Stack.Screen 
          name="HomeTabs" 
          component={BottomNavigation} 
          options={{ headerShown: false }} // Skjul headeren for bundnavigationen
        />
        {/* Tilføj ProfileScreen til stacken */}
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
