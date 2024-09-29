import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import moment from 'moment';  // Install moment.js for date handling

const HomeScreen = () => {
  const [waterIntake, setWaterIntake] = useState('');
  const [totalIntake, setTotalIntake] = useState(0);
  const [error, setError] = useState(null);
  const today = moment().format('YYYY-MM-DD');  // Get today's date in YYYY-MM-DD format

  // Gem vandindtag for den nuværende dag
  const handleSave = async () => {
    try {
      const docRef = doc(db, "waterIntake", today);  // Reference til dokumentet med dagens dato
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Hvis dokumentet for dagen allerede eksisterer, opdater det samlede vandindtag
        const currentTotal = docSnap.data().total || 0;
        const newTotal = currentTotal + (parseInt(waterIntake) || 0);
        await updateDoc(docRef, { total: newTotal });
        setTotalIntake(newTotal);

        // Tilføj den nye indtastning som et underdokument i 'inputs' samlingen
        const inputsRef = collection(docRef, 'inputs');
        await addDoc(inputsRef, { intake: parseInt(waterIntake) || 0, timestamp: new Date() });
      } else {
        // Hvis dokumentet ikke eksisterer, opret det med den første indtastning
        const newTotal = parseInt(waterIntake) || 0;
        await setDoc(docRef, { total: newTotal });

        // Opret inputs samlingen og tilføj den første indtastning
        const inputsRef = collection(docRef, 'inputs');
        await addDoc(inputsRef, { intake: parseInt(waterIntake) || 0, timestamp: new Date() });
        setTotalIntake(newTotal);
      }

      setWaterIntake(''); // Nulstil inputfeltet
    } catch (error) {
      setError("Kunne ikke gemme vandindtag. Prøv igen.");
      console.error("Fejl ved gemning af vandindtag:", error);
    }
  };

  // Hent det samlede vandindtag for i dag
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "waterIntake", today);  // Reference til dagens dokument
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTotalIntake(docSnap.data().total);
        } else {
          setTotalIntake(0);  // Hvis der ikke er noget gemt endnu, start fra 0
        }
      } catch (error) {
        setError("Kunne ikke hente vandindtag. Prøv igen senere.");
        console.error("Fejl ved hentning af vandindtag:", error);
      }
    };
    fetchData();
  }, [today]);

  return (
    // Wrapping everything in TouchableWithoutFeedback to dismiss the keyboard on tap outside input
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text>Indtast hvor mange ml vand du har drukket i dag:</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          value={waterIntake} 
          onChangeText={setWaterIntake} 
          placeholder="F.eks. 500"
        />
        <Button title="Gem vandindtag" onPress={handleSave} />
        {error && <Text style={styles.error}>{error}</Text>}
        <Text>Samlet vandindtag i dag: {totalIntake} ml</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 200,
    marginVertical: 10,
    paddingHorizontal: 10
  },
  error: {
    color: 'red',
    marginTop: 10
  }
});

export default HomeScreen;
