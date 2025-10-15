import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { IconSymbol } from "../../components/ui/IconSymbol";
import { useState } from "react";
import { BleManager } from "react-native-ble-plx";
import { useLanguage, Language } from "../context/LanguageContext";

// Initialize Bluetooth Manager
const manager = new BleManager();

async function requestPermissions() {
  if (Platform.OS === "android") {
    if (Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    } else {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  }
}

export default function LiveConnectScreen() {
  const colorScheme = useColorScheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soilData, setSoilData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const { currentLanguage, setLanguage, t } = useLanguage();

  requestPermissions();

  const scanForDevices = () => {
    setIsScanning(true);
    setDevices([]);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        if (error.message === "BluetoothLE is powered off"){
          setIsScanning(false);
          Alert.alert("Error", "Please turn on Bluetooth to scan for devices.");
          return false;
        }
        console.error(error);
        setIsScanning(false);
        return false;
      }

      if (device && device.id) {
        setDevices((prevDevices) => {
          const exists = prevDevices.some((d) => d.id === device.id);
          if (!exists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      };
    });
    return true;
  };

  const loadMockData = () => {
    setIsConnected(true);
    setIsConnecting(false);
    setIsScanning(false);
    function randomBetween(min, max) {
      return +(Math.random() * (max - min) + min).toFixed(2);
    }

    const mockData = {
      pH: randomBetween(5.5, 8.0),          // typical soil pH range
      nitrogen: randomBetween(10, 120),     // kg/ha or ppm, depending on context
      phosphorus: randomBetween(5, 60),     // same unit consistency
      potassium: randomBetween(50, 200),
      moisture: randomBetween(30, 90),      // percentage
      temperature: randomBetween(10, 40),   // °C
      ec: randomBetween(0.5, 3.0)           // dS/m (electrical conductivity)
    };

    setSoilData(mockData);
    Alert.alert("Success", "Connected to Agni device successfully!");
  };

  const handleBluetoothScan = async () => {
    setIsScanning(true);
    try {
      // Simulate Bluetooth scanning and connection
      scanForDevices() || loadMockData();

    } catch (error) {
      setIsScanning(false);
      Alert.alert("Error", "Failed to connect to Agni device");
    }
  };

  // Connect to a device
  const connectToDevice = async (device) => {
    setIsConnecting(true);
    try {
      // Note: Expo Bluetooth API has limitations with connecting to specific devices
      // You might need to use device-specific SDK or alternative approach
      Alert.alert('Info', `Would connect to ${device.name} - Device specific connection logic needed`);
      
      // For actual implementation, you'd need:
      // 1. Device-specific SDK or documentation
      // 2. Service UUIDs and characteristic UUIDs
      // 3. Custom connection logic
      
      setConnectedDevice(device);
      
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect to the device');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const languages: Language[] = ['English', 'Odia', 'Hindi'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? "light"].primary }}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* 4. Language Selector Section */}
          <ThemedView style={styles.languageSelector} lightColor="#f0f0f0" darkColor="#1c1c1c">
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  currentLanguage === lang && { 
                    backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  }
                ]}
                onPress={() => setLanguage(lang as Language)}
              >
                <ThemedText 
                  style={[
                    styles.languageText, 
                    currentLanguage === lang ? { color: Colors.light.background } : { color: Colors[colorScheme ?? 'light'].text } // White text for active button
                  ]}
                  lightColor={currentLanguage === lang ? Colors.light.background : Colors.dark.text}
                  darkColor={currentLanguage === lang ? Colors.dark.background : Colors.light.text}
                >
                  {/* The language name itself ('English', 'Odia', 'Hindi') can often be used directly as the label, but to translate the phrase "Local Language" if needed: */}
                  {/* {t(lang)} */} 
                  {lang}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
          <ThemedText style={styles.title}>{t('Live Connect')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('Connect your Agni device to analyze soil data in real-time')}
          </ThemedText>

          <View style={styles.connectionSection}>
            <View
              style={[
                styles.connectionCard,
                { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
              ]}
            >
              <IconSymbol
                size={64}
                name="antenna.radiowaves.left.and.right"
                color={
                  isConnected
                    ? Colors[colorScheme ?? "light"].primary
                    : Colors[colorScheme ?? "light"].secondary
                }
              />
              <Text style={styles.sectionTitle}>Available Devices:</Text>
              {isScanning && devices.length === 0 && (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.scanningText}>{t('Scanning for devices...')}</Text>
                </View>
              )}

              <ScrollView style={styles.devicesList}>
                {devices.map(device => (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceItem, 
                      connectedDevice && connectedDevice.id === device.id && styles.connectedDevice
                    ]}
                    onPress={() => connectToDevice(device)}
                    disabled={connectedDevice !== null && connectedDevice.id !== device.id}
                  >
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                    </View>
                    {isConnecting && connectedDevice && connectedDevice.id === device.id ? (
                      <ActivityIndicator size="small" color="#4CAF50" />
                    ) : connectedDevice && connectedDevice.id === device.id ? (
                      <Text style={styles.connectedText}>{t('Connected')}</Text>
                    ) : (
                      <Text style={styles.connectText}>{t('Tap to Connect')}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>


            <View style={styles.controls}>
              <TouchableOpacity 
                style={[
                styles.scanButton,
                { backgroundColor: Colors[colorScheme ?? "light"].primary },
              ]} 
                onPress={scanForDevices}
                disabled={isScanning}
              >
              <Text style={styles.scanButtonText}>
                {isScanning ? t('Scanning...') : t('Scan for Devices')}
              </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.scanButton, styles.mockButton]} 
                onPress={loadMockData}
              >
              <Text style={styles.scanButtonText}>{t('Load Mock Data')}</Text>
              </TouchableOpacity>
              
              {connectedDevice && (
                <TouchableOpacity 
                  style={[styles.scanButton, styles.disconnectButton]}
                >
                  <Text style={styles.scanButtonText}>{t('Disconnect')}</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>

          {soilData && (
            <View style={styles.dataSection}>
              <ThemedText style={styles.dataTitle}>{t('Soil Analysis Data')}</ThemedText>
              <View style={styles.dataGrid}>
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                  ]}
                >
                  <ThemedText style={styles.dataLabel}>pH Level</ThemedText>
                  <ThemedText style={styles.dataValue}>{soilData.pH}</ThemedText>
                </View>
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                  ]}
                >
                  <ThemedText style={styles.dataLabel}>Nitrogen</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {soilData.nitrogen} ppm
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                  ]}
                >
                  <ThemedText style={styles.dataLabel}>Phosphorus</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {soilData.phosphorus} ppm
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                  ]}
                >
                  <ThemedText style={styles.dataLabel}>Potassium</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {soilData.potassium} ppm
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                  ]}
                >
                  <ThemedText style={styles.dataLabel}>Moisture</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {soilData.moisture}%
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                  ]}
                >
                  <ThemedText style={styles.dataLabel}>Temperature</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {soilData.temperature}°C
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  connectionSection: {
    alignItems: "center",
    marginBottom: 32,
    flex: 1,
  },
  connectionCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  connectionStatus: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  connectionSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  mockButton: {
    backgroundColor: '#2196F3',
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  devicesList: {
    width: 300,
    marginBottom: 20,
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedDevice: {
    borderLeftColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceDetails: {
    fontSize: 10,
    color: '#888',
  },
  connectText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 12,
  },
  connectedText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 12,
  },
  dataSection: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dataCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  dataLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scanningText: {
    marginTop: 10,
    color: '#666',
  },
});
