import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();

  const testHistory = [
    {
      id: 1,
      date: '2025-09-19',
      time: '14:30',
      location: 'Field A - Block 1',
      pH: 6.8,
      status: 'Neutral',
      color: Colors[colorScheme ?? 'light'].primary,
      latitude: 20.2961,
      longitude: 85.8245
    },
    {
      id: 2,
      date: '2025-09-18',
      time: '09:15',
      location: 'Field B - Block 2',
      pH: 5.2,
      status: 'Acidic',
      color: '#f44336',
      latitude: 20.2980,
      longitude: 85.8260
    },
    {
      id: 3,
      date: '2025-09-17',
      time: '16:45',
      location: 'Field C - Block 1',
      pH: 7.8,
      status: 'Alkaline',
      color: '#2196f3',
      latitude: 20.2950,
      longitude: 85.8230
    }
  ];

  const stats = {
    totalTests: 15,
    avgPH: 6.5,
    improvement: '+0.3'
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>History & Analytics</ThemedText>
      <ThemedText style={styles.subtitle}>
        Track your soil health trends and field performance over time
      </ThemedText>

      {/* Filter Controls */}
      <View style={styles.filterSection}>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
          <IconSymbol size={16} name="calendar" color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText style={styles.filterText}>Last 30 Days</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
          <IconSymbol size={16} name="slider.horizontal.3" color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText style={styles.filterText}>pH Level</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
          <IconSymbol size={16} name="square.and.arrow.up" color="white" />
          <ThemedText style={styles.exportText}>Export</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsSection}>
        <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
          <ThemedText style={styles.statValue}>{stats.totalTests}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Tests</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
          <ThemedText style={styles.statValue}>{stats.avgPH}</ThemedText>
          <ThemedText style={styles.statLabel}>Avg pH</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
          <ThemedText style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
            {stats.improvement}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Improvement</ThemedText>
        </View>
      </View>

      {/* Interactive Map Placeholder */}
      <View style={styles.mapSection}>
        <ThemedText style={styles.mapTitle}>Field Test Locations</ThemedText>
        <View style={styles.mapContainer}>
          <View style={[styles.map, styles.mapPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <IconSymbol size={48} name="map" color={Colors[colorScheme ?? 'light'].secondary} />
            <ThemedText style={styles.mapPlaceholderText}>Interactive Map</ThemedText>
            <ThemedText style={styles.mapPlaceholderSubtext}>
              Interactive maps will be available once you provide the Google Maps API key. Field locations will be displayed with color-coded pH indicators.
            </ThemedText>
            
            {/* Location List */}
            <View style={styles.locationList}>
              {testHistory.map((test) => (
                <View key={test.id} style={[styles.locationItem, { backgroundColor: Colors[colorScheme ?? 'light'].neutral }]}>
                  <View style={[styles.locationPin, { backgroundColor: test.color }]} />
                  <View style={styles.locationInfo}>
                    <ThemedText style={styles.locationName}>{test.location}</ThemedText>
                    <ThemedText style={styles.locationDetails}>pH: {test.pH} - {test.status}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Test History Log */}
      <View style={styles.historySection}>
        <ThemedText style={styles.historyTitle}>Test History Log</ThemedText>
        <ScrollView style={styles.historyList}>
          {testHistory.map((test) => (
            <View key={test.id} style={[styles.historyItem, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <View style={[styles.statusIndicator, { backgroundColor: test.color }]} />
              <View style={styles.historyContent}>
                <ThemedText style={styles.historyLocation}>{test.location}</ThemedText>
                <ThemedText style={styles.historyDetails}>
                  pH: {test.pH} - {test.status} | {test.date} at {test.time}
                </ThemedText>
              </View>
              <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].icon} />
            </View>
          ))}
        </ScrollView>
      </View>
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
    paddingHorizontal: 24,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  locationList: {
    width: '100%',
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  locationPin: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: 12,
    opacity: 0.7,
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