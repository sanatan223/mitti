import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState } from 'react';
import LanguageDropdown from '../../components/Languageselector';
import { useLanguage } from '../context/LanguageContext';

export default function AboutScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const colorScheme = useColorScheme();
  const { t } = useLanguage()
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const teamMembers = [
    {
      id: 1,
      name: 'Nilambar Behera',
      role: 'Project Manager & Hardware Manufacturer',
      description: 'BCA graduate with interest in agricultural technology solutions'
    },
    {
      id: 2,
      name: 'Sanatan Sethi',
      role: 'Software Engineer & AI Specialist',
      description: 'Software engineer with experties in web and mobile app development'
    }
  ];

  const features = [
    {
      icon: 'cpu',
      title: 'Advanced Sensors',
      description: 'Multi-parameter soil analysis with laboratory-grade accuracy'
    },
    {
      icon: 'brain.head.profile',
      title: 'AI Processing',
      description: 'Machine learning algorithms trained on local soil data'
    },
    {
      icon: 'globe.americas',
      title: 'Local Language Support',
      description: 'Recommendations in Odia, Hindi, and English with audio support'
    }
  ];

  const FORMSPREE_ENDPOINT_URL = process.env.EXPO_PUBLIC_FORMSPREE_URL; 

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' }); 

    try {
      const formData = {
        name: contactForm.name,
        _replyto: contactForm.email, 
        message: contactForm.message,
      };

      console.log('Sending data to third-party service:', formData);
      
      const response = await fetch(FORMSPREE_ENDPOINT_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMsg = 'The form submission failed on the service side.';
        try {
            const errorData = await response.json(); 
            errorMsg = errorData.error || errorMsg;
        } catch (e) {
            console.error('Error parsing error response:', e);
        }
        throw new Error(errorMsg);
      }
      
      setStatus({ type: 'success', message: 'Success! Your message has been sent to the recipients.' });
      
      setContactForm({ name: '', email: '', message: '' });

    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ type: 'error', message: `Submission Failed: ${error.message || 'Could not connect to the form handling service.'}` });
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      setStatus({ type: null, message: '' });
    }, 5000);
  };

  const statusBackgroundColor = status.type === 'success' ? '#d4edda' : '#f8d7da';
  const statusBorderColor = status.type === 'success' ? '#c3e6cb' : '#f5c6cb';
  const statusTextColor = status.type === 'success' ? '#155724' : '#721c24';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background, paddingBottom: -40 }}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LanguageDropdown />

          {/* Header */}
          <View style={styles.header}>
            <IconSymbol size={64} name="leaf.fill" color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={styles.title}>{t('About Saathi AI')}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('Revolutionizing agriculture through organic intelligence, empowering farmers with AI-driven insights for sustainable farming practices.')}
            </ThemedText>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('Our Mission')}</ThemedText>
            <ThemedText style={styles.missionText}>
              {t('At Agni Innovations, we believe that technology should serve those who feed the world. Our mission is to bridge the gap between advanced agricultural science and traditional farming wisdom, making precision agriculture accessible to every farmer.')}
            </ThemedText>
            <ThemedText style={styles.missionText}>
              {t('Saathi AI combines the power of artificial intelligence with deep understanding of local farming practices, delivering personalized recommendations in farmers\' native languages.')}
            </ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.statNumber}>5+</ThemedText>
              <ThemedText style={styles.statLabel}>{t('Years of Research')}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.statNumber}>50+</ThemedText>
              <ThemedText style={styles.statLabel}>{t('Farming Partners')}</ThemedText>
            </View>
          </View>

          {/* Technology Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('How Our Technology Works')}</ThemedText>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <View style={[styles.featureIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <IconSymbol size={24} name={feature.icon as any} color="white" />
                </View>
                <View style={styles.featureContent}>
                  <ThemedText style={styles.featureTitle}>{t(feature.title)}</ThemedText>
                  <ThemedText style={styles.featureDescription}>{t(feature.description)}</ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Meet Our Team</ThemedText>
            {teamMembers.map((member) => (
              <View key={member.id} style={[styles.teamCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <IconSymbol size={32} name="person.fill" color="white" />
                </View>
                <View style={styles.teamContent}>
                  <ThemedText style={styles.teamName}>{member.name}</ThemedText>
                  <ThemedText style={styles.teamRole}>{t(member.role)}</ThemedText>
                  <ThemedText style={styles.teamDescription}>{t(member.description)}</ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* Testimonials */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('What Farmers Say')}</ThemedText>
            <View style={[styles.testimonialCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <IconSymbol size={32} name="person.crop.circle.fill" color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.testimonialText}>
                {t('"Saathi AI helped me understand my soil better. The Odia recommendations made it so easy to follow, and my crop yield improved by 30% this season."')}
              </ThemedText>
              <ThemedText style={styles.testimonialAuthor}>- Suresh Mohanty, Farmer from Bhubaneswar</ThemedText>
            </View>
            <View style={[styles.testimonialCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <IconSymbol size={32} name="person.crop.circle.fill" color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.testimonialText}>
                {t('"The AI chat feature is amazing! I can ask questions anytime and get instant answers in my language. It\'s like having an agricultural expert in my pocket."')}
              </ThemedText>
              <ThemedText style={styles.testimonialAuthor}>- Lakshmi Sahoo, Progressive Farmer Cuttack</ThemedText>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Get In Touch</ThemedText>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <IconSymbol size={20} name="location.fill" color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.contactText}>Bhadrak auto. College, Bhadrak, Odisha, 756100</ThemedText>
              </View>
            </View>

            {status.type && (
              <View style={[styles.statusBox, { backgroundColor: statusBackgroundColor, borderColor: statusBorderColor }]}>
                <ThemedText style={[styles.statusText, { color: statusTextColor }]}>{status.message}</ThemedText>
              </View>
            )}

            <View style={[styles.contactForm, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <ThemedText style={styles.formTitle}>Send us a Message</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                placeholderTextColor={Colors[colorScheme == 'light' ?'dark':'light'].lightGray}
                placeholder="Full Name"
                value={contactForm.name}
                onChangeText={(text) => setContactForm({...contactForm, name: text})}
              />
              <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                placeholderTextColor={Colors[colorScheme == 'light' ?'dark':'light'].background}
                placeholder="Email Address"
                value={contactForm.email}
                onChangeText={(text) => setContactForm({...contactForm, email: text})}
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, styles.messageInput, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                placeholderTextColor={Colors[colorScheme == 'light' ?'dark':'light'].background}
                placeholder="Tell us about your farming needs"
                value={contactForm.message}
                onChangeText={(text) => setContactForm({...contactForm, message: text})}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleSubmitContact}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Send Message</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.8,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  teamCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  teamContent: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 24,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  contactInfo: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
  },
  statusBox: {
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactForm: {
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});