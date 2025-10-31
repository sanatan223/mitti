import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
//import MapView, { Marker, Region } from 'react-native-maps';
import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getTestRecords, SoilTestRecord, clearTestRecordById } from '../../database/datastorage';
import { useSoilTest, SoilTestProvider } from '../context/SoilTestContext';
import { useLanguage, Language } from "../context/LanguageContext";
import LanguageDropdown from '../../components/Languageselector';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();
  const [historyRecords, setHistoryRecords] = useState<SoilTestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const { triggerHistoryRefresh } = useSoilTest();
  const { currentLanguage, setLanguage, t } = useLanguage();

  const fetchHistory = async () => {
    setIsLoading(true);
    const records = await getTestRecords();
    setHistoryRecords(records);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    // Use an event listener here to re-fetch when the screen comes into focus
    navigation.addListener('focus', fetchHistory);
    return navigation.removeListener('focus', fetchHistory); 
  }, []);

  useEffect(() => {
      fetchHistory();
  }, [triggerHistoryRefresh]);

  // Use the fetched data for statistics
  const totalTests = historyRecords.length;
  const avgPH = totalTests > 0 
    ? (historyRecords.reduce((sum, rec) => sum + rec.soilData.pH, 0) / totalTests).toFixed(1)
    : 'N/A';
  
  // Mock improvement stat (needs actual historical data logic for a real calculation)
  const stats = {
    totalTests: totalTests,
    avgPH: avgPH,
    improvement: '+0.3' // Static for now
  };

  // Function to navigate to AI Chat with the record ID
  const navigateToChat = (recordId: string) => {
    // In a real app:
    navigation.navigate('ai-chat', { recordId });
    console.log(`Navigating to AIChatScreen with recordId: ${recordId}`);
    alert(`Redirect to Chat for Test ID: ${recordId} (Check console for mock navigation)`);
  };

  // Function to center the map on a specific marker (retained for structure)
  const onLocationPress = (id: string, latitude: number, longitude: number) => {
    // ... (Map logic remains the same)
  };

  const deleteRecord = async(id: string) => {
    await clearTestRecordById(id);
    fetchHistory();
  }

  const languages: Language[] = ['English', 'Odia', 'Hindi'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? "light"].primary }}>
      <SoilTestProvider>
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <LanguageDropdown />
            <ThemedText style={styles.title}>{t('History & Analytics')}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('Track your soil health trends and field performance over time')}
            </ThemedText>

            {/* Filter Controls */}
            <View style={styles.filterSection}>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <IconSymbol size={16} name="calendar" color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.filterText}>{t('Last 30 Days')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <IconSymbol size={16} name="slider.horizontal.3" color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.filterText}>{t('pH Level')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exportButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <IconSymbol size={16} name="square.and.arrow.up" color="white" />
                <ThemedText style={styles.exportText}>{t('Export')}</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsSection}>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <ThemedText style={styles.statValue}>{stats.totalTests}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('Total Tests')}</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <ThemedText style={styles.statValue}>{stats.avgPH}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('Avg pH')}</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <ThemedText style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {stats.improvement}
                </ThemedText>
                <ThemedText style={styles.statLabel}>{t('Improvement')}</ThemedText>
              </View>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapSection}>
              <ThemedText style={styles.mapTitle}>{t('Field Test Locations')}</ThemedText>
              <View style={styles.mapContainer}>
                {/*
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={initialRegion}
                >
                  {testHistory.map((test) => (
                    <Marker
                      key={test.id}
                      coordinate={{ latitude: test.latitude, longitude: test.longitude }}
                      title={test.location}
                      description={`pH: ${test.pH} - ${test.status}`}
                      pinColor={test.color} // Use a prop for the pin color
                    />
                  ))}
                </MapView>
              */}
              <ThemedText>{t('Sorry, Map is temporarily unavailable.')}</ThemedText>
              </View>
            </View>

            {/* Test History Log */}
            <View style={styles.historySection}>
              <ThemedText style={styles.historyTitle}>{t('Test History Log')}</ThemedText>
              <View style={styles.historyList}>
                {historyRecords.map((test) => (
                  <TouchableOpacity
                    key={test.id}
                    style={[styles.historyItem, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}
                    onPress={() => navigateToChat(test.id)}
                  >
                    <View style={[styles.statusIndicator, { backgroundColor: test.pHColor }]} />
                    <View style={styles.historyContent}>
                      <ThemedText style={styles.historyLocation}>{test.location}</ThemedText>
                        <ThemedText style={styles.historyDetails}>
                          pH: {test.soilData.pH} - {test.pHStatus} | {test.date} at {test.time}
                        </ThemedText>
                    </View>
                    <TouchableOpacity 
                      style={[styles.exportButton, { backgroundColor: Colors[colorScheme ?? 'light'].danger }]}
                      onPress={() => { deleteRecord(test.id); }}
                    >
                      <IconSymbol size={16} name="trash.fill" color="white" />
                      <ThemedText style={styles.exportText}>{t('Delete')}</ThemedText>
                    </TouchableOpacity>
                    <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].icon} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </ScrollView>
        </ThemedView>
      </SoilTestProvider>
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  filterSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  filterText: {
    fontSize: 14,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  exportText: {
    fontSize: 14,
    color: 'white',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  mapSection: {
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  historySection: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyLocation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
});
