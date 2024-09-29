import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import BottomNavigation from './navigation/BottomNavigation';
import { initializeFirebase } from './config/firebase'; // Firebase initialization

// Initialiser Firebase
initializeFirebase();

export default function App() {
  return (
    <NavigationContainer>
      <BottomNavigation />
    </NavigationContainer>
  );
}
