import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState } from 'react';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      role: 'Lead Agricultural Scientist',
      description: '15+ years in soil science and precision agriculture research'
    },
    {
      id: 2,
      name: 'Rajesh Patel',
      role: 'AI & Technology Lead',
      description: 'Expert in machine learning algorithms and IoT device development'
    },
    {
      id: 3,
      name: 'Meera Das',
      role: 'Community Outreach Manager',
      description: 'Connecting technology with farming communities across India'
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

  const handleSubmitContact = () => {
    if (contactForm.name && contactForm.email && contactForm.message) {
      Alert.alert('Thank You!', 'Your message has been sent. We will get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol size={64} name="leaf.fill" color={Colors[colorScheme ?? 'light'].primary} />
          <ThemedText style={styles.title}>About Saathi AI</ThemedText>
          <ThemedText style={styles.subtitle}>
            Revolutionizing agriculture through organic intelligence, empowering farmers
            with AI-driven insights for sustainable farming practices.
          </ThemedText>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
          <ThemedText style={styles.missionText}>
            At Agni Innovations, we believe that technology should serve those who feed the world. 
            Our mission is to bridge the gap between advanced agricultural science and traditional 
            farming wisdom, making precision agriculture accessible to every farmer.
          </ThemedText>
          <ThemedText style={styles.missionText}>
            Saathi AI combines the power of artificial intelligence with deep understanding of 
            local farming practices, delivering personalized recommendations in farmers' native languages.
          </ThemedText>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>5+</ThemedText>
            <ThemedText style={styles.statLabel}>Years of Research</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.statNumber}>50+</ThemedText>
            <ThemedText style={styles.statLabel}>Farming Partners</ThemedText>
          </View>
        </View>

        {/* Technology Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>How Our Technology Works</ThemedText>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <View style={[styles.featureIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <IconSymbol size={24} name={feature.icon as any} color="white" />
              </View>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
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
                <ThemedText style={styles.teamRole}>{member.role}</ThemedText>
                <ThemedText style={styles.teamDescription}>{member.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What Farmers Say</ThemedText>
          <View style={[styles.testimonialCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <IconSymbol size={32} name="person.crop.circle.fill" color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={styles.testimonialText}>
              "Saathi AI helped me understand my soil better. The Odia recommendations 
              made it so easy to follow, and my crop yield improved by 30% this season."
            </ThemedText>
            <ThemedText style={styles.testimonialAuthor}>- Suresh Mohanty, Farmer from Bhubaneswar</ThemedText>
          </View>
          <View style={[styles.testimonialCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <IconSymbol size={32} name="person.crop.circle.fill" color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={styles.testimonialText}>
              "The AI chat feature is amazing! I can ask questions anytime and get 
              instant answers in my language. It's like having an agricultural expert 
              in my pocket."
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
              <ThemedText style={styles.contactText}>Bhubaneswar, Odisha, India</ThemedText>
            </View>
            <View style={styles.contactItem}>
              <IconSymbol size={20} name="phone.fill" color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.contactText}>+91 98765 43210</ThemedText>
            </View>
            <View style={styles.contactItem}>
              <IconSymbol size={20} name="envelope.fill" color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.contactText}>info@saathiai.com</ThemedText>
            </View>
          </View>

          <View style={[styles.contactForm, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
            <ThemedText style={styles.formTitle}>Send us a Message</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={contactForm.name}
              onChangeText={(text) => setContactForm({...contactForm, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={contactForm.email}
              onChangeText={(text) => setContactForm({...contactForm, email: text})}
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, styles.messageInput]}
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
              <ThemedText style={styles.submitButtonText}>Send Message</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
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