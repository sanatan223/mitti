import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useState } from 'react';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const [stats, setStats] = useState({
    farmsAnalyzed: 127,
    soilTests: 284,
    aiRecommendations: 195
  });

  const handleConnectDevice = () => {
    router.push('/(tabs)/live-connect');
  };

  const handleViewDemo = () => {
    // Show demo or tutorial
    console.log('Show demo');
  };

  const benefits = [
    {
      icon: 'timer',
      title: 'Instant Analysis',
      description: 'Get comprehensive soil health data in seconds with our Agni device.'
    },
    {
      icon: 'globe.asia.australia.fill',
      title: 'Local Language',
      description: 'Receive recommendations in Odia, Hindi, or English with voice support.'
    },
    {
      icon: 'leaf.fill',
      title: 'Sustainable Farming',
      description: 'AI-powered organic fertilizer recommendations for better crop yield.'
    },
    {
      icon: 'map.fill',
      title: 'Field Mapping',
      description: 'Visualize your soil data on interactive maps for better field management.'
    }
  ];

  const steps = [
    {
      number: 1,
      icon: 'cable.connector',
      title: 'Scan Soil with Agni',
      description: 'Insert your Agni device into the soil and press the scan button for instant analysis.'
    },
    {
      number: 2,
      icon: 'antenna.radiowaves.left.and.right',
      title: 'Connect to Saathi',
      description: 'Automatically sync your data via Bluetooth to the Saathi AI platform.'
    },
    {
      number: 3,
      icon: 'brain.head.profile',
      title: 'Get AI Recommendations',
      description: 'Receive personalized fertilizer advice in your local language with voice playback.'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>
              The <ThemedText style={{ color: Colors[colorScheme ?? 'light'].primary, fontSize: 36, fontWeight: 'bold' }}>Organic</ThemedText>
              {'\n'}Intelligence
              {'\n'}Platform
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Empower your farming with AI-driven soil analysis. Connect your Agni device, 
              get instant soil health insights, and receive personalized recommendations in your local language.
            </ThemedText>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleConnectDevice}
              >
                <IconSymbol size={20} name="antenna.radiowaves.left.and.right" color="white" />
                <ThemedText style={styles.primaryButtonText}>Connect Your Device</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleViewDemo}
              >
                <IconSymbol size={20} name="play.circle" color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  View Demo
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Device Connection Status */}
          <View style={[styles.deviceStatus, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <IconSymbol size={48} name="antenna.radiowaves.left.and.right" color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={styles.deviceStatusTitle}>Agni Device Connected</ThemedText>
            <ThemedText style={styles.deviceStatusSubtitle}>Real-time soil analysis</ThemedText>
          </View>
        </View>

        {/* Live Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>{stats.farmsAnalyzed}</ThemedText>
            <ThemedText style={styles.statLabel}>Farms Analyzed</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>{stats.soilTests}</ThemedText>
            <ThemedText style={styles.statLabel}>Soil Tests</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>{stats.aiRecommendations}</ThemedText>
            <ThemedText style={styles.statLabel}>AI Recommendations</ThemedText>
          </View>
        </View>

        {/* Why Choose Saathi AI */}
        <View style={styles.benefitsSection}>
          <ThemedText style={styles.sectionTitle}>Why Choose Saathi AI?</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Advanced technology meets traditional farming wisdom to maximize your harvest potential.
          </ThemedText>
          
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <View style={[styles.benefitIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <IconSymbol size={24} name={benefit.icon} color="white" />
                </View>
                <ThemedText style={styles.benefitTitle}>{benefit.title}</ThemedText>
                <ThemedText style={styles.benefitDescription}>{benefit.description}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.stepsSection}>
          <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Simple 3-step process to transform your farming approach
          </ThemedText>
          
          {steps.map((step, index) => (
            <View key={index} style={[styles.stepCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <View style={[styles.stepNumber, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <ThemedText style={styles.stepNumberText}>{step.number}</ThemedText>
              </View>
              <View style={[styles.stepIcon, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
                <IconSymbol size={32} name={step.icon} color="white" />
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                <ThemedText style={styles.stepDescription}>{step.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    gap: 24,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceStatus: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  deviceStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  deviceStatusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  benefitsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  benefitCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  stepsSection: {
    padding: 24,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
