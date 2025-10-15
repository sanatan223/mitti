import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState } from 'react';
import { router } from 'expo-router';
import { useLanguage, Language } from '../context/LanguageContext'; 

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const { currentLanguage, setLanguage, t } = useLanguage(); 

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
      title: t('Instant Analysis'), 
      description: t('Get comprehensive soil health data in seconds with our Agni device.')
    },
    {
      icon: 'earth',
      title: t('Local Language'),
      description: t('Receive recommendations in Odia, Hindi, or English with voice support.')
    },
    {
      icon: 'leaf',
      title: t('Sustainable Farming'),
      description: t('AI-powered organic fertilizer recommendations for better crop yield.')
    },
    {
      icon: 'map',
      title: t('Expert Support'),
      description: t('Connect with agricultural experts for personalized advice.')
    }
  ];

  const steps = [
    {
      number: 1,
      icon: 'power-plug-outline',
      title: t('Connect Device'),
      description: t('Pair and connect your Agni soil sensor device via Bluetooth.'),
      color: Colors[colorScheme ?? 'light'].primary,
    },
    {
      number: 2,
      icon: 'antenna',
      title: t('Take Sample'),
      description: t('Insert the sensor into the soil and press the analysis button on the device.'),
      color: '#FF9800', // Amber
    },
    {
      number: 3,
      icon: 'brain',
      title: t('Get Results'),
      description: t('Receive instant, personalized soil health and fertilizer recommendations.'),
      color: '#4CAF50', // Green
    },
  ];

  const languages: Language[] = ['English', 'Odia', 'Hindi'];


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
        
        {/* Hero Text Section */}
        <ThemedText style={styles.heroTitle}>
          {/* Split the translation key for the colored text */}
          {t('The')} <ThemedText style={{ color: Colors[colorScheme ?? 'light'].primary, fontSize: 36, fontWeight: 'bold' }}>{t('Organic')}</ThemedText>
          {t('Intelligence')}
          {t('Platform')}
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          {t(`Empower your farming with AI-driven soil analysis. Connect your Agni device, get instant soil health insights, and receive personalized recommendations in your local language.`)}
        </ThemedText>
        
        {/* Buttons Section */}
        <View style={styles.heroButtons}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleConnectDevice}
          >
            <IconSymbol name="link" size={20} color="white" />
            <ThemedText style={styles.primaryButtonText} lightColor="white" darkColor="white">{t('Connect Your Device')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleViewDemo}
          >
            <IconSymbol size={20} name="play.circle" color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {t('View Demo')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Live Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>{stats.farmsAnalyzed}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('Farms Analyzed')}</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>{stats.soilTests}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('Soil Tests')}</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>{stats.aiRecommendations}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('AI Recommendations')}</ThemedText>
          </View>
        </View>

        {/* Why Choose Saathi AI */}
        <View style={styles.benefitsSection}>
          <ThemedText style={styles.sectionTitle}>{t('Why Choose Saathi AI?')}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {t('Advanced technology meets traditional farming wisdom to maximize your harvest potential.')}
          </ThemedText>
          
          <View style={styles.benefitsGrid}>
            {/* NOTE: benefits.map already uses t(benefit.title) and t(benefit.description) because the data is defined in the component, but we keep the structure here. */}
            {benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <View style={[styles.benefitIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <MaterialCommunityIcons name={benefit.icon as any} size={24} color="white" />
                </View>
                <ThemedText style={styles.benefitTitle}>{t(benefit.title)}</ThemedText>
                <ThemedText style={styles.benefitDescription}>{t(benefit.description)}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.stepsSection}>
          <ThemedText style={styles.sectionTitle}>{t('How It Works')}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {t('Simple 3-step process to transform your farming approach')}
          </ThemedText>
          
          <View>
            {steps.map((step, index) => (
              <View key={index} style={[styles.stepCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <View style={[styles.stepNumber, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <ThemedText style={styles.stepNumberText}>{step.number}</ThemedText>
                </View>
                <View style={[styles.stepIcon, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
                  <MaterialCommunityIcons name={step.icon as any} size={32} color="white" />
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>{t(step.title)}</ThemedText>
                  <ThemedText style={styles.stepDescription}>{t(step.description)}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
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
  scrollContainer: {
    paddingBottom: 40,
  },
});
