import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, doc } from "firebase/firestore";
import moment from 'moment';

const StatsScreen = () => {
  const [inputs, setInputs] = useState([]);
  const [totalIntake, setTotalIntake] = useState(0);
  const [error, setError] = useState(null);
  const today = moment().format('YYYY-MM-DD');  // Få dagens dato i YYYY-MM-DD format

  // Hent vandindtagsdata fra Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "waterIntake", today);
        const inputsRef = collection(docRef, "inputs");
        const querySnapshot = await getDocs(inputsRef);
        const inputData = [];
        let total = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          inputData.push({ id: doc.id, intake: data.intake, timestamp: data.timestamp });
          total += data.intake;
        });

        setInputs(inputData);
        setTotalIntake(total);  // Opdater den samlede mængde vand
      } catch (error) {
        setError("Kunne ikke hente data. Prøv igen senere.");
        console.error("Fejl ved hentning af data:", error);
      }
    };

    fetchData();
  }, [today]);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.header}>Dine vandindtag:</Text>

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

      <Text style={styles.total}>Samlet vandindtag i dag: {totalIntake} ml</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  total: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  }
});

export default StatsScreen;
