import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, ScrollView } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot } from "firebase/firestore";
import moment from 'moment';
import { BarChart } from 'react-native-chart-kit';

// Beregner skærmbredden til diagrammet
const screenWidth = Dimensions.get("window").width - 40; // Juster bredden efter behov

const HistoryScreen = () => {
  // State til at gemme historikdata og eventuelle fejl
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reference til 'waterIntake' kollektionen i Firestore
    const waterIntakeRef = collection(db, "waterIntake");

    // Opsætter en realtidslytter for ændringer i 'waterIntake' kollektionen
    const unsubscribe = onSnapshot(waterIntakeRef, (querySnapshot) => {
      const data = [];

      // Gennemgår hvert dokument i snapshot'et
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          date: doc.id, // Dokument-ID bruges som dato
          total: docData.total || 0, // Vandindtag eller 0 hvis ikke angivet
        });
      });

      // Sorterer data efter dato, nyeste først
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Opdaterer state med den hentede og sorterede data
      setHistoryData(data);
    }, (err) => {
      // Håndterer fejl ved hentning af data
      setError("Kunne ikke hente historikdata. Prøv igen senere.");
      console.error("Fejl ved hentning af historikdata:", err);
    });

    // Rydder lytteren op, når komponenten unmountes
    return () => unsubscribe();
  }, []);

  // Forbereder data til bar chart
  const prepareChartData = () => {
    const labels = historyData.map(item => moment(item.date).format('MM-DD'));
    const data = historyData.map(item => item.total);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
        },
      ],
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Vandindtagshistorik</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Viser en liste over historikdata */}
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.date}>{moment(item.date).format('LL')}</Text>
            <Text style={styles.total}>{item.total} ml</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Ingen historikdata tilgængelig.</Text>}
      />

      {/* Viser et bar chart hvis der er data */}
      {historyData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartHeader}>Dagligt Vandindtag (ml)</Text>
          <BarChart
            data={prepareChartData()}
            width={screenWidth} // Juster bredden efter behov
            height={220}
            yAxisLabel=""
            yAxisSuffix="ml"
            chartConfig={{
              backgroundColor: "#1e90ff",
              backgroundGradientFrom: "#87cefa",
              backgroundGradientTo: "#1e90ff",
              decimalPlaces: 0, // Ingen decimaler
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForBackgroundLines: {
                stroke: "#e3e3e3",
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};

// Stylesheet til komponenten
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  date: {
    fontSize: 16,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  chartHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e90ff',
    textAlign: 'center',
  },
});

export default HistoryScreen;
// Eksporterer HistoryScreen-komponenten
