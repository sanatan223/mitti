import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { IconSymbol } from "../../components/ui/IconSymbol";
import { useState, useRef, useEffect } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { useLanguage, Language } from "../context/LanguageContext";
import { SoilData, saveTestRecord, SoilTestRecord } from "../../database/datastorage";
import { useSoilTest, SoilTestProvider } from '../context/SoilTestContext';
import LanguageDropdown from "../../components/Languageselector";
import * as FileSystem from 'expo-file-system/legacy';

// --- Configuration ---
const TARGET_DEVICE_NAME = "AGNI-SOIL-SENSOR";
const FILE_SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const FILE_CHAR_UUID = "abcdef12-3456-7890-1234-567890abcdef";
const OUTPUT_DIRECTORY = `${FileSystem.documentDirectory}sensor_files/`;
// ---------------------

// Initialize Bluetooth Manager
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

// Helper function to convert array to base64
function arrayToBase64(array: number[]): string {
  const bytes = new Uint8Array(array);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to convert array to string
function arrayToString(array: number[]): string {
  const bytes = new Uint8Array(array);
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

export default function LiveConnectScreen() {
  const colorScheme = useColorScheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useLanguage();
  const [currentLocation, setCurrentLocation] = useState('My Field');
  const [transferLogs, setTransferLogs] = useState<string[]>([]);
  const [isReceivingFiles, setIsReceivingFiles] = useState(false);
  
  const { 
    setLatestRecordId, 
    setLatestSoilData, 
    setTriggerHistoryRefresh
  } = useSoilTest();

  useEffect(() => {
    if (setTriggerHistoryRefresh) {
      setSoilData(null);
    }
  }, [setTriggerHistoryRefresh]);

  // File transfer refs
  const currentFileDataRef = useRef<number[]>([]);
  const transferCompleteRef = useRef(false);

  useEffect(() => {
    // Create output directory
    FileSystem.makeDirectoryAsync(OUTPUT_DIRECTORY, { intermediates: true })
      .catch(err => {
        console.log('Directory already exists or error:', err);
      });

    return () => {
      if (connectedDevice) {
        connectedDevice.cancelConnection();
      }
    };
  }, []);

  const addTransferLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTransferLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const parseSoilDataFromFile = async (filePath: string, fileName: string) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      let parsedData: SoilData | null = null;

      if (fileName.endsWith('.json')) {
        const jsonData = JSON.parse(fileContent);
        parsedData = {
          pH: jsonData.pH || jsonData.ph || 0,
          nitrogen: jsonData.nitrogen || jsonData.N || 0,
          phosphorus: jsonData.phosphorus || jsonData.P || 0,
          potassium: jsonData.potassium || jsonData.K || 0,
          moisture: jsonData.moisture || 0,
          temperature: jsonData.temperature || jsonData.temp || 0,
          ec: jsonData.ec || jsonData.EC || 0
        };
      } else if (fileName.endsWith('.csv')) {
        // Simple CSV parsing (assumes header row and data row)
        const lines = fileContent.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const values = lines[1].split(',').map(v => parseFloat(v.trim()));
          
          parsedData = {
            pH: values[headers.indexOf('ph')] || 0,
            nitrogen: values[headers.indexOf('nitrogen')] || values[headers.indexOf('n')] || 0,
            phosphorus: values[headers.indexOf('phosphorus')] || values[headers.indexOf('p')] || 0,
            potassium: values[headers.indexOf('potassium')] || values[headers.indexOf('k')] || 0,
            moisture: values[headers.indexOf('moisture')] || 0,
            temperature: values[headers.indexOf('temperature')] || values[headers.indexOf('temp')] || 0,
            ec: values[headers.indexOf('ec')] || 0
          };
        }
      }

      if (parsedData && Object.values(parsedData).some(v => v > 0)) {
        setSoilData(parsedData);
        addTransferLog(`📊 Parsed soil data from ${fileName}`);
        
        const newRecord: Omit<SoilTestRecord, 'id' | 'date' | 'time'> = {
          soilData: parsedData,
          chatHistory: [],
          pHStatus: 'Neutral',
          pHColor: '',
          latitude: 0,
          longitude: 0,
          location: currentLocation,
        };
        
        const savedRecord = await saveTestRecord(newRecord, currentLocation);
        if (savedRecord) {
          setLatestRecordId(savedRecord.id);
          setLatestSoilData(savedRecord.soilData);
          setTriggerHistoryRefresh(Date.now());
          addTransferLog(`💾 Saved test record (ID: ${savedRecord.id})`);
        }
      }
    } catch (error: any) {
      addTransferLog(`⚠️ Could not parse soil data from ${fileName}: ${error.message}`);
    }
  };

  const notificationHandler = async (error: any, characteristic: any) => {
    if (error) {
      addTransferLog(`❌ Notification error: ${error.message}`);
      return;
    }

    if (!characteristic?.value) return;

    // Decode base64 data
    const base64Data = characteristic.value;
    const binaryString = atob(base64Data);
    const data: number[] = [];
    for (let i = 0; i < binaryString.length; i++) {
      data.push(binaryString.charCodeAt(i));
    }
    
    let textData: string;
    try {
      textData = arrayToString(data);
    } catch (e) {
      currentFileDataRef.current.push(...data);
      addTransferLog(`Received ${data.length} bytes of file data...`);
      return;
    }

    if (textData.startsWith("FILE_END:")) {
      const fileName = textData.split(":").pop()?.trim().split('/').pop() || 'unknown';
      addTransferLog(`📁 Transfer complete for: ${fileName}`);

      if (currentFileDataRef.current.length === 0) {
        addTransferLog(`⚠️ Warning: No data received for ${fileName}`);
        return;
      }

      try {
        const filePath = `${OUTPUT_DIRECTORY}${fileName}`;
        const base64Content = arrayToBase64(currentFileDataRef.current);
        
        await FileSystem.writeAsStringAsync(filePath, base64Content, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        addTransferLog(`✅ Successfully saved ${fileName} (${currentFileDataRef.current.length} bytes)`);
        addTransferLog(`📂 Saved to: ${filePath}`);

        if (fileName.endsWith('.csv') || fileName.endsWith('.json')) {
          await parseSoilDataFromFile(filePath, fileName);
        }
      } catch (error: any) {
        addTransferLog(`❌ Error saving ${fileName}: ${error.message}`);
      }

      currentFileDataRef.current = [];

    } else if (textData.startsWith("TRANSFER_COMPLETE")) {
      addTransferLog(`🎉 ${textData.trim()}`);
      addTransferLog("All files received.");
      transferCompleteRef.current = true;
      setIsReceivingFiles(false);
      
      Alert.alert(
        "Transfer Complete", 
        "All files have been received successfully!",
        [{ text: "OK" }]
      );

    } else {
      const preview = textData.trim().substring(0, 50);
      addTransferLog(`Received data chunk: ${preview}${textData.length > 50 ? '...' : ''}`);
      currentFileDataRef.current.push(...data);
    }
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

    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        if (error.message === "BluetoothLE is powered off") {
          setIsScanning(false);
          Alert.alert("Error", "Please turn on Bluetooth to scan for devices.");
          return;
        }
        console.error(error);
        addTransferLog(`❌ Scan error: ${error.message}`);
        setIsScanning(false);
        return;
      }

      if (device && device.id) {
        setDevices((prevDevices) => {
          const exists = prevDevices.some((d) => d.id === device.id);
          if (!exists) {
            if (device.name) {
              addTransferLog(`📱 Found device: ${device.name}`);
            }
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      if (isScanning) {
        manager.stopDeviceScan();
        setIsScanning(false);
        addTransferLog(`⏹️ Scan timeout - found ${devices.length} devices`);
      }
    }, 30000);
  };

  const stopScanning = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
    addTransferLog(`⏹️ Scanning stopped`);
  };

  const connectToDevice = async (device: Device) => {
    setIsConnecting(true);
    stopScanning();

    try {
      addTransferLog(`🔌 Connecting to ${device.name || device.id}...`);
      
      const connectedDev = await device.connect();
      setConnectedDevice(connectedDev);
      setIsConnected(true);
      setIsConnecting(false);

      const deviceName = device.name || 'Unknown Device';
      const deviceId = device.id;
      
      addTransferLog(`✅ Connected to ${deviceName} (${deviceId})`);

      await connectedDev.discoverAllServicesAndCharacteristics();
      addTransferLog(`🔍 Discovering services...`);

      const services = await connectedDev.services();
      const hasFileService = services.some(s => s.uuid.toLowerCase() === FILE_SERVICE_UUID.toLowerCase());

      if (hasFileService) {
        addTransferLog(`📡 File transfer service found!`);
        addTransferLog(`📥 Subscribing to file notifications...`);
        
        currentFileDataRef.current = [];
        transferCompleteRef.current = false;
        setIsReceivingFiles(true);

        connectedDev.monitorCharacteristicForService(
          FILE_SERVICE_UUID,
          FILE_CHAR_UUID,
          notificationHandler
        );

        addTransferLog(`🚀 Ready to receive files...`);
        Alert.alert(
          "Connected",
          `Connected to ${deviceName} (UID: ${deviceId})! File transfer will begin automatically.`,          [{ text: "OK" }]
        );
      } else {
        addTransferLog(`ℹ️ This device doesn't support file transfer`);
        Alert.alert(
          "Connected",
          `Connected to ${deviceName} (UID: ${deviceId}), but file transfer service not found.`,          [{ text: "OK" }]
        );
      }

      connectedDev.onDisconnected((error, device) => {
        setIsConnected(false);
        setConnectedDevice(null);
        setIsReceivingFiles(false);
        if (error) {
          addTransferLog(`❌ Disconnected with error: ${error.message}`);
        } else {
          addTransferLog(`🔌 Disconnected from device`);
        }
      });

    } catch (error: any) {
      addTransferLog(`❌ Connection failed: ${error.message}`);
      Alert.alert('Error', `Failed to connect: ${error.message}`);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectedDevice(null);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setIsConnected(false);
        setIsReceivingFiles(false);
        addTransferLog(`🔌 Manually disconnected`);
      } catch (error: any) {
        addTransferLog(`❌ Disconnect error: ${error.message}`);
      }
    }
  };

  const loadMockData = async () => {
    setIsConnecting(false);
    setIsScanning(false);

    const mockDevice = {
      id: "MOCK-DEVICE-UUID",
      name: "Mock Agni Sensor",
    };

    setConnectedDevice(mockDevice as any);
    setIsConnected(true);

    function randomBetween(min: number, max: number) {
      return +(Math.random() * (max - min) + min).toFixed(2);
    }

    const mockData: SoilData = {
      pH: randomBetween(5.5, 8.0),
      nitrogen: randomBetween(10, 120),
      phosphorus: randomBetween(5, 60),
      potassium: randomBetween(50, 200),
      moisture: randomBetween(30, 90),
      temperature: randomBetween(10, 40),
      ec: randomBetween(0.5, 3.0)
    };

    setSoilData(mockData);
    
    const newRecord: Omit<SoilTestRecord, 'id' | 'date' | 'time'> = {
      soilData: mockData,
      chatHistory: [],
      pHStatus: 'Neutral',
      pHColor: '',
      latitude: 0,
      longitude: 0,
      location: currentLocation,
    };
    
    const savedRecord = await saveTestRecord(newRecord, currentLocation);

    if (savedRecord) {
      setLatestRecordId(savedRecord.id);
      setLatestSoilData(savedRecord.soilData);
      setTriggerHistoryRefresh(Date.now());
      Alert.alert("Success", `Connected to Mock Agni Sensor (UID: MOCK-DEVICE-UUID)! Mock data loaded and saved (ID: ${savedRecord.id})!`);
    } else {
      Alert.alert("Error", "Failed to save mock data to local storage.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? "light"].primary }}>
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
                  color={
                    isConnected
                      ? Colors[colorScheme ?? "light"].primary
                      : Colors[colorScheme ?? "light"].secondary
                  }
                />
                
                {isReceivingFiles && (
                  <View style={styles.receivingBadge}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <Text style={styles.receivingText}>Receiving Files...</Text>
                  </View>
                )}

                <Text style={styles.sectionTitle}>{t('Available Devices:')}</Text>
                
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
                      disabled={(connectedDevice !== null && connectedDevice.id !== device.id) || isConnecting}
                    >
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                        <Text style={styles.deviceId}>{device.id}</Text>
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
                    (isScanning || isConnected) && styles.buttonDisabled
                  ]}
                  onPress={isScanning ? stopScanning : scanForDevices}
                  disabled={isConnected}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? t('Stop Scanning') : t('Scan for Devices')}
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
                    onPress={disconnectDevice}
                  >
                    <Text style={styles.scanButtonText}>{t('Disconnect')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Transfer Logs */}
              {transferLogs.length > 0 && (
                <View style={styles.logsContainer}>
                  <Text style={styles.logsTitle}>📋 Transfer Log:</Text>
                  <ScrollView style={styles.logsScroll} nestedScrollEnabled>
                    {transferLogs.slice(-10).map((log, index) => (
                      <Text key={index} style={styles.logText}>{log}</Text>
                    ))}
                  </ScrollView>
                </View>
              )}
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
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>EC</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.ec} mS/cm
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