import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { IconSymbol } from "../../components/ui/IconSymbol";
import { useState, useEffect } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { useLanguage, Language } from "../context/LanguageContext";
import { getAllSoilRecords, SoilData } from "../../database/datastorage";
import { useSoilTest, SoilTestProvider } from '../context/SoilTestContext';
import LanguageDropdown from "../../components/Languageselector";
import { startAgniSession, stopAgniSession, setLogListener } from "../connect";

const manager = new BleManager();

async function requestPermissions() {
  if (Platform.OS === "android") {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
}

export default function LiveConnectScreen() {
  const colorScheme = useColorScheme();
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useLanguage();
  const [transferLogs, setTransferLogs] = useState<string[]>([]);

  useEffect(() => {
    setLogListener((msg) => {
      setTransferLogs(prev => [msg, ...prev]);
    });

    const retriveData = () => {
      getAllSoilRecords().then((data) => {
        setSoilData(data[0].data);
      });
    };
    retriveData();

    return () => setLogListener(null);
  }, []);

  const addTransferLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTransferLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const scanForDevices = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Error', 'Bluetooth permissions are required');
      return;
    }

    const state = await manager.state();
    if (state !== 'PoweredOn') {
      Alert.alert('Error', 'Please turn on Bluetooth to scan for devices');
      return;
    }

    setIsScanning(true);
    setDevices([]);
    addTransferLog(`🔍 Scanning for devices...`);

    startAgniSession();
   
  };

  const stopScanning = () => {
    stopAgniSession();
    setIsScanning(false);
    addTransferLog(`⏹️ Scanning stopped`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background, paddingBottom: -40 }}>
      <SoilTestProvider>
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <LanguageDropdown />
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
                  color={Colors[colorScheme ?? "light"].primary}
                />
                
                {isScanning && devices.length === 0 && (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.scanningText}>{transferLogs[0]}</Text>
                  </View>
                )}
              </View>

              <View style={styles.controls}>
                <TouchableOpacity
                  style={[
                    styles.scanButton,
                    { backgroundColor: Colors[colorScheme ?? "light"].primary },
                    (isScanning) && styles.buttonDisabled
                  ]}
                  onPress={isScanning ? stopScanning : scanForDevices}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? t('Stop Scanning') : t('Scan for Devices')}
                  </Text>
                </TouchableOpacity>
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
                    <ThemedText style={styles.dataValue}>{soilData.ph}</ThemedText>
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
                      {soilData.temp}°C
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Conductivity</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.conductivity}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </SoilTestProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 16,
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
  receivingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
  },
  receivingText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
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
    paddingHorizontal: 16,
    borderRadius: 12,
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
    width: '100%',
    maxHeight: 200,
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
  logsContainer: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  logsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  logsScroll: {
    maxHeight: 200,
  },
  logText: {
    color: '#00ff00',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
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