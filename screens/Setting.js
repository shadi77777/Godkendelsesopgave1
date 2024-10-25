import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Switch, TextInput,
  TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('2000'); // Standard dagligt mål i ml

  // Hent indstillinger fra AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationsValue = await AsyncStorage.getItem('notificationsEnabled');
        if (notificationsValue !== null) {
          setNotificationsEnabled(JSON.parse(notificationsValue));
        }

        const dailyGoalValue = await AsyncStorage.getItem('dailyGoal');
        if (dailyGoalValue !== null) {
          setDailyGoal(dailyGoalValue);
        }
      } catch (error) {
        console.error('Fejl ved indlæsning af indstillinger:', error);
      }
    };

    loadSettings();
  }, []);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
      // Tilføj her logik til at aktivere/deaktivere notifikationer
    } catch (error) {
      console.error('Fejl ved lagring af notifikationsindstilling:', error);
    }
  };

  const handleDailyGoalChange = async (value) => {
    setDailyGoal(value);
    try {
      await AsyncStorage.setItem('dailyGoal', value);
      // Tilføj her logik til at opdatere det daglige mål i appen
    } catch (error) {
      console.error('Fejl ved lagring af dagligt mål:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Indstillinger</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Aktiver notifikationer</Text>
          <Switch
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dagligt vandindtagsmål (ml)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={dailyGoal}
            onChangeText={handleDailyGoalChange}
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1e90ff',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: 100,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
});

export default SettingsScreen;
