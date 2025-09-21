import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { Card, Button } from "react-native-paper";
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function App() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Mitti AI</Text>
        <View style={styles.nav}>
          <Text style={styles.navText}>Home</Text>
          <Text style={styles.navText}>Analysis</Text>
          <Text style={styles.navText}>Soil Map</Text>
          <Text style={styles.navText}>Contact</Text>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.highlight}>built for Farmers, work for Farmers, innovate for Farmers</Text>
      </View>

      {/* Device Status */}
      <Card style={styles.deviceCard}>
        <Text style={styles.deviceText}>Device Status</Text>
        <Button mode="contained" style={styles.connectBtn}>
          Connected
        </Button>
      </Card>

      {/* Recent Soil Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Soil Analysis</Text>
        <View style={styles.tabs}>
          <Button mode="outlined" style={styles.tab}>Field 1</Button>
          <Button mode="outlined" style={styles.tab}>Field 2</Button>
          <Button mode="outlined" style={styles.tab}>Field 3</Button>
          <Button mode="outlined" style={styles.tab}>Field 4</Button>
        </View>
        <Card style={styles.analysisCard}>
          <Text>Analyzing your soil in depth...</Text>
        </Card>
      </View>

      {/* Soil Map */}
      <View>
        <Text style={styles.sectionTitle}>High Resolution Soil Map</Text>
        <Text style={styles.mapDesc}>
          Explore detailed soil health data, nutrient distribution and regional
          soil fertility.
        </Text>
        <View style={styles.mapSection}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f9f1", paddingTop: 30 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#c7eacb",
  },
  logo: { fontSize: 20, fontWeight: "bold" },
  nav: { flexDirection: "row", gap: 15 },
  navText: { fontSize: 14, marginHorizontal: 5 },

  // Title
  titleSection: { padding: 20, alignItems: "center", height: 80 },
  subtitle: { fontSize: 16, marginBottom: 5 },
  highlight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d7c3a",
    marginBottom: 15,
  },
  imageRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
  image: { width: 80, height: 80, marginHorizontal: 5 },

  // Device Status
  deviceCard: {
    margin: 15,
    padding: 15,
    alignItems: "center",
  },
  deviceText: { fontSize: 16 },
  connectBtn: { marginTop: 10, backgroundColor: "#6cba7c" },

  // Soil Analysis
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 15 },
  tab: { borderRadius: 20 },
  analysisCard: { padding: 20 },

  // Map
  mapSection: { padding: 20, alignItems: "center", backgroundColor: "red" },
  mapDesc: { fontSize: 14, textAlign: "center", marginBottom: 10 },
  mapImage: { width: 250, height: 200, borderRadius: 10 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 30,
    padding: 15,
    backgroundColor: "#c7eacb",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  watermark: {
    fontSize: 12,
    color: "#333",
    opacity: 0.5,
    marginTop: 5,
    fontStyle: "italic",
  },
});
