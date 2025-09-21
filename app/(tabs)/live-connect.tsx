import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState } from 'react';

export default function LiveConnectScreen() {
  const colorScheme = useColorScheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soilData, setSoilData] = useState(null);

  const handleBluetoothScan = async () => {
    setIsConnecting(true);
    try {
      // Simulate Bluetooth scanning and connection
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        setSoilData({
          pH: 6.8,
          nitrogen: 85,
          phosphorus: 42,
          potassium: 156,
          moisture: 68,
          temperature: 24,
          ec: 1.2
        });
        Alert.alert('Success', 'Connected to Agni device successfully!');
      }, 3000);
    } catch (error) {
      setIsConnecting(false);
      Alert.alert('Error', 'Failed to connect to Agni device');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Live Connect</ThemedText>
      <ThemedText style={styles.subtitle}>
        Connect your Agni device to analyze soil data in real-time
      </ThemedText>

      <View style={styles.connectionSection}>
        <View style={[styles.connectionCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
          <IconSymbol 
            size={64} 
            name={isConnected ? "checkmark.circle.fill" : "antenna.radiowaves.left.and.right"} 
            color={isConnected ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].secondary} 
          />
          <ThemedText style={styles.connectionStatus}>
            {isConnecting ? 'Scanning...' : isConnected ? 'Connected to Agni-01' : 'Ready to Connect'}
          </ThemedText>
          <ThemedText style={styles.connectionSubtext}>
            {isConnecting ? 'Looking for Agni device' : isConnected ? 'Real-time soil analysis' : 'Click below to scan for Agni device'}
          </ThemedText>
        </View>

        <TouchableOpacity 
          style={[styles.scanButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleBluetoothScan}
          disabled={isConnecting || isConnected}
        >
          <IconSymbol size={24} name="magnifyingglass" color="white" />
          <Text style={styles.scanButtonText}>
            {isConnecting ? 'Scanning...' : isConnected ? 'Connected' : 'Scan for Agni Device'}
          </Text>
        </TouchableOpacity>
      </View>

      {soilData && (
        <View style={styles.dataSection}>
          <ThemedText style={styles.dataTitle}>Soil Analysis Data</ThemedText>
          <View style={styles.dataGrid}>
            <View style={[styles.dataCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.dataLabel}>pH Level</ThemedText>
              <ThemedText style={styles.dataValue}>{soilData.pH}</ThemedText>
            </View>
            <View style={[styles.dataCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.dataLabel}>Nitrogen</ThemedText>
              <ThemedText style={styles.dataValue}>{soilData.nitrogen} ppm</ThemedText>
            </View>
            <View style={[styles.dataCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.dataLabel}>Phosphorus</ThemedText>
              <ThemedText style={styles.dataValue}>{soilData.phosphorus} ppm</ThemedText>
            </View>
            <View style={[styles.dataCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.dataLabel}>Potassium</ThemedText>
              <ThemedText style={styles.dataValue}>{soilData.potassium} ppm</ThemedText>
            </View>
            <View style={[styles.dataCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.dataLabel}>Moisture</ThemedText>
              <ThemedText style={styles.dataValue}>{soilData.moisture}%</ThemedText>
            </View>
            <View style={[styles.dataCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.dataLabel}>Temperature</ThemedText>
              <ThemedText style={styles.dataValue}>{soilData.temperature}°C</ThemedText>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  connectionSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  connectionCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  connectionStatus: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  connectionSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dataSection: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});