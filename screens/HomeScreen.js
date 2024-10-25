import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Keyboard, TouchableWithoutFeedback, ScrollView, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { initializeFirebase, db } from '../config/firebase';
import { doc, collection, addDoc, getDoc, getDocs, deleteDoc, setDoc } from "firebase/firestore";

// Initialiserer Firebase
initializeFirebase();

const HomeScreen = ({ navigation }) => {
  // State til at håndtere vandindtag, total indtag, fejlbeskeder, brugerens navn og profilbillede
  const [waterIntake, setWaterIntake] = useState('');
  const [totalIntake, setTotalIntake] = useState(0);
  const [error, setError] = useState(null);
  const today = moment().format('YYYY-MM-DD'); // Dagens dato i formatet YYYY-MM-DD

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Hent profildata, når skærmen kommer i fokus
  useFocusEffect(
    React.useCallback(() => {
      const loadProfile = async () => {
        try {
          const profileData = await AsyncStorage.getItem('profile');
          if (profileData !== null) {
            const { profileImage, name } = JSON.parse(profileData);
            setProfileImage(profileImage);
            setName(name);
          } else {
            setProfileImage(null);
            setName('');
          }
        } catch (error) {
          console.error('Fejl ved indlæsning af profildata:', error);
        }
      };

      loadProfile();

      return () => {};
    }, [])
  );

  // Hent total vandindtag for i dag fra AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const intake = await AsyncStorage.getItem(`waterIntake_${today}`);
        if (intake !== null) {
          setTotalIntake(parseInt(intake));
        } else {
          setTotalIntake(0);
        }
      } catch (error) {
        setError("Kunne ikke hente data. Prøv igen senere.");
        console.error("Fejl ved hentning af data:", error);
      }
    };

    fetchData();
  }, [today]);

  // Gem vandindtag lokalt i AsyncStorage og i Firestore
  const handleSave = async () => {
    try {
      let newIntake = parseInt(waterIntake) || 0;
      let currentTotal = totalIntake || 0;
      let newTotal = newIntake + currentTotal;

      // Gem det nye total i AsyncStorage
      await AsyncStorage.setItem(`waterIntake_${today}`, newTotal.toString());

      setTotalIntake(newTotal);
      setWaterIntake('');

      // Gem data i Firestore
      await handleSaveToFirestore(newIntake);
    } catch (error) {
      setError("Kunne ikke gemme vandindtag. Prøv igen.");
      console.error("Fejl ved gemning af vandindtag:", error);
    }
  };

  // Funktion til at gemme vandindtag i Firestore
  const handleSaveToFirestore = async (intake) => {
    try {
      const docRef = doc(db, "waterIntake", today); // Referér til dagens dokument

      // Hent den nuværende total fra dokumentet
      const docSnap = await getDoc(docRef);
      let currentTotal = 0;
      if (docSnap.exists()) {
        const data = docSnap.data();
        currentTotal = data.total || 0;
      }

      // Opdater total
      const newTotal = currentTotal + intake;

      // Opdater dokumentet med det nye total
      await setDoc(docRef, { total: newTotal }, { merge: true });

      // Tilføj input til inputs underkollektionen
      const inputsRef = collection(docRef, "inputs");
      await addDoc(inputsRef, {
        intake: intake,
        timestamp: new Date(),
      });

      console.log("Data gemt i Firestore");
    } catch (error) {
      console.error("Fejl ved gemning i Firestore:", error);
    }
  };

  // Funktion til at nulstille vandindtag i Firestore
  const handleResetFirestoreData = async () => {
    try {
      const docRef = doc(db, "waterIntake", today);
      const inputsRef = collection(docRef, "inputs");
      const querySnapshot = await getDocs(inputsRef);
      const deletePromises = querySnapshot.docs.map((inputDoc) => deleteDoc(inputDoc.ref));
      await Promise.all(deletePromises);
      await setDoc(docRef, { total: 0 }); // Sæt total til 0
      console.log("Vandindtagsdata nulstillet i Firestore");
    } catch (error) {
      setError("Kunne ikke nulstille vandindtagsdata. Prøv igen senere.");
      console.error("Fejl ved nulstilling af data i Firestore:", error);
    }
  };

  // Funktion til at nulstille vandindtag lokalt og i Firestore
  const handleReset = async () => {
    try {
      await AsyncStorage.setItem(`waterIntake_${today}`, '0');
      setTotalIntake(0);
      await handleResetFirestoreData(); // Nulstil også Firestore-data
    } catch (error) {
      setError("Kunne ikke nulstille vandindtagelsen. Prøv igen.");
      console.error("Fejl ved nulstilling af vandindtagelse:", error);
    }
  };

  // Test Firebase forbindelse ved komponentens mount
  useEffect(() => {
    const testFirestoreConnection = async () => {
      try {
        const docRef = doc(db, "waterIntake", "testDoc");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Data fra Firestore:", docSnap.data());
        } else {
          console.log("Ingen dokumenter fundet.");
        }
      } catch (error) {
        console.error("Fejl ved læsning fra Firestore:", error);
      }
    };

    testFirestoreConnection();
  }, []);

  return (
    // Gør det muligt at trykke uden for inputfelter for at skjule tastaturet
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Profilikon */}
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => navigation.navigate('Profile')} // Naviger til Profile-skærmen
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="#1e90ff" />
            )}
          </TouchableOpacity>

          {/* Velkomsthilsen */}
          <Text style={styles.header}>
            Velkommen{ name ? `, ${name}` : '' }!
          </Text>

          {/* Inputfelt til vandindtag */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={waterIntake}
              onChangeText={setWaterIntake}
              placeholder="Indtast vandindtag i ml"
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Gem</Text>
            </TouchableOpacity>
          </View>

          {/* Fejlmeddelelse */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Viser total vandindtag */}
          <Text style={styles.totalIntake}>Total vandindtag i dag: {totalIntake} ml</Text>

          {/* Nulstillingsknap */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Nulstil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

// Stylesheet til komponenten
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  profileIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1e90ff',
    textAlign: 'center',
    marginTop: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'transparent',
    borderWidth: 1,
    width: 150,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginRight: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalIntake: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;
// Eksporterer HomeScreen-komponenten
