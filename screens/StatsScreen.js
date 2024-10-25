import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, getDocs, deleteDoc, setDoc } from "firebase/firestore";
import moment from 'moment';
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Beregner skærmbredden til diagrammet
const screenWidth = Dimensions.get("window").width;

const StatsScreen = ({ navigation, route }) => {
  // State til at gemme inputs, total vandindtag og eventuelle fejl
  const [inputs, setInputs] = useState([]);
  const [totalIntake, setTotalIntake] = useState(0);
  const [error, setError] = useState(null);
  const today = moment().format('YYYY-MM-DD');  // Dagens dato i formatet ÅÅÅÅ-MM-DD

  /**
   * Funktion til at nulstille vandindtagsdata i Firestore
   */
  const resetFirestoreData = async () => {
    try {
      const docRef = doc(db, "waterIntake", today); // Referencer til dagens dokument i 'waterIntake' kollektionen
      const inputsRef = collection(docRef, "inputs"); // Underkollektion til individuelle indtastninger
      const querySnapshot = await getDocs(inputsRef); // Henter alle dokumenter i 'inputs'

      // Opretter en liste af promises til at slette hvert input-dokument
      const deletePromises = querySnapshot.docs.map((inputDoc) => deleteDoc(inputDoc.ref));
      await Promise.all(deletePromises); // Venter på, at alle sletninger er fuldført

      await setDoc(docRef, {}); // Sikrer, at dokumentet eksisterer, selvom inputs er slettet
      setInputs([]); // Nulstiller inputs state
      setTotalIntake(0); // Nulstiller total vandindtag
      console.log("Vandindtagsdata nulstillet i Firestore");
    } catch (error) {
      setError("Kunne ikke nulstille vandindtagsdata. Prøv igen senere.");
      console.error("Fejl ved nulstilling af data i Firestore:", error);
    }
  };

  /**
   * Funktion til at hente vandindtagsdata fra Firestore
   * Bruges sammen med useFocusEffect for at lytte til realtidsopdateringer
   */
  const fetchData = useCallback(() => {
    try {
      if (!db) {
        console.error("Firestore er ikke initialiseret!");
        return;
      }

      console.log('Firestore er initialiseret:', db);

      const docRef = doc(db, "waterIntake", today); // Referencer til dagens dokument
      const inputsRef = collection(docRef, "inputs"); // Underkollektion til individuelle indtastninger
      console.log('Inputs ref:', inputsRef);

      // Opsætter en realtidslytter på 'inputs' kollektionen
      const unsubscribe = onSnapshot(inputsRef, (querySnapshot) => {
        const inputData = [];
        let total = 0;

        // Gennemgår hvert dokument i snapshot'et
        querySnapshot.forEach((docu) => {
          const data = docu.data();
          inputData.push({ id: docu.id, intake: data.intake, timestamp: data.timestamp });
          total += data.intake; // Akkumulerer total vandindtag
        });

        // Sorterer data efter tidsstempel (ældste først)
        inputData.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

        // Beregner akkumulerede totaler for hver indtastning
        let cumulativeTotal = 0;
        const cumulativeData = inputData.map((entry) => {
          cumulativeTotal += entry.intake;
          return {
            ...entry,
            cumulativeTotal: cumulativeTotal,
          };
        });

        console.log('Data modtaget fra Firestore:', cumulativeData);
        setInputs(cumulativeData); // Opdaterer inputs state med akkumulerede data
        setTotalIntake(total); // Opdaterer total vandindtag state
      });

      // Returnerer unsubscribe-funktionen for at stoppe lytteren ved komponentens unmount
      return unsubscribe;
    } catch (error) {
      setError("Kunne ikke hente data. Prøv igen senere.");
      console.error("Fejl ved hentning af data:", error);
    }
  }, [today]);

  // Bruger useFocusEffect til at hente data, når skærmen får fokus
  useFocusEffect(fetchData);

  /**
   * useEffect til at lytte til nulstil-besked fra HomeScreen via route parameters
   * Hvis 'reset' parametern er sand, nulstiller den data og henter på ny
   */
  useEffect(() => {
    if (route.params?.reset) {
      resetFirestoreData().then(() => {
        fetchData();
      });
      navigation.setParams({ reset: false }); // Nulstiller reset parameteren
    }
  }, [route.params?.reset]);

  return (
    <View style={styles.containerStats}>
      {/* Viser en fejlmeddelelse, hvis der er en fejl */}
      {error && <Text style={styles.error}>{error}</Text>}
      
      {/* Overskrift */}
      <Text style={styles.header}>Dit vandindtag:</Text>

      {/* Grafisk visning af vandindtag */}
      {inputs.length > 0 ? (
        <LineChart
          data={{
            labels: inputs.map((input) => moment(input.timestamp.toDate()).format('HH:mm')), // Labels for diagrammet (tidspunkt)
            datasets: [
              {
                data: inputs.map((input) => input.cumulativeTotal), // Data for diagrammet (akkumuleret total)
              },
            ],
          }}
          width={screenWidth - 40} // Justerer bredden på diagrammet
          height={220}
          yAxisSuffix=" ml"
          chartConfig={{
            backgroundColor: "#1e90ff",
            backgroundGradientFrom: "#1e90ff",
            backgroundGradientTo: "#87cefa",
            decimalPlaces: 0, // Ingen decimaler
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Farve for linjen
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Farve for labels
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffffff",
            },
          }}
          bezier
          style={{
            marginVertical: 20,
            borderRadius: 16,
          }}
        />
      ) : (
        // Viser en besked, hvis der ikke er nogen indtastninger
        <Text style={styles.noDataText}>Ingen indtastninger endnu</Text>
      )}

      {/* Liste over individuelle vandindtag */}
      <FlatList
        data={inputs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{moment(item.timestamp.toDate()).format('HH:mm:ss')}: {item.intake} ml</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Ingen indtastninger endnu</Text>}
      />

      {/* Viser det totale vandindtag for i dag */}
      <Text style={styles.total}>Total vandindtag i dag: {totalIntake} ml</Text>
    </View>
  );
};

// Stylesheet til komponenten
const styles = StyleSheet.create({
  containerStats: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1e90ff',
    textAlign: 'center',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  total: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 20,
  },
});

export default StatsScreen;
// Eksporterer StatsScreen-komponenten
