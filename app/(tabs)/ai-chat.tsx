import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState } from 'react';
import * as Speech from 'expo-speech';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const suggestedQuestions = [
    "How to improve phosphorus naturally?",
    "What does acidic soil mean?",
    "Organic nitrogen sources?",
    "Best crops for my soil type?"
  ];

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        isUser: true,
        timestamp: new Date()
      };

      const aiResponse: Message = {
        id: messages.length + 2,
        text: `Thank you for your question about "${inputText}". This is a demo response. In the full app, I would provide detailed agricultural advice in your selected language (${selectedLanguage}).`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages([...messages, userMessage, aiResponse]);
      setInputText('');
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const handleSpeakMessage = (text: string) => {
    const languageCode = selectedLanguage === 'Hindi' ? 'hi-IN' : 
                        selectedLanguage === 'Odia' ? 'hi-IN' : 'en-US'; // Odia fallback to Hindi
    
    Speech.speak(text, {
      language: languageCode,
      pitch: 1.0,
      rate: 0.8,
      onStart: () => console.log('Speech started'),
      onDone: () => console.log('Speech finished'),
      onError: (error) => {
        console.error('Speech error:', error);
        Alert.alert('Error', 'Could not play speech');
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? "light"].primary }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.assistantBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <IconSymbol size={24} name="brain.head.profile" color="white" />
            <ThemedText style={styles.assistantTitle}>Saathi AI Assistant</ThemedText>
          </View>
          <ThemedText style={styles.assistantSubtitle}>
            Ask me anything about soil health and farming
          </ThemedText>

          {/* Language Selector */}
          <View style={styles.languageSection}>
            <TouchableOpacity 
              style={[
                styles.languageButton, 
                selectedLanguage === 'English' && { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                { backgroundColor: selectedLanguage === 'English' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].lightGray }
              ]}
              onPress={() => setSelectedLanguage('English')}
            >
              <ThemedText style={[styles.languageText, selectedLanguage === 'English' && { color: 'white' }]}>
                English (English)
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.languageButton,
                { backgroundColor: selectedLanguage === 'Hindi' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].lightGray }
              ]}
              onPress={() => setSelectedLanguage('Hindi')}
            >
              <ThemedText style={[styles.languageText, selectedLanguage === 'Hindi' && { color: 'white' }]}>
                हिंदी (Hindi)
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.languageButton,
                { backgroundColor: selectedLanguage === 'Odia' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].lightGray }
              ]}
              onPress={() => setSelectedLanguage('Odia')}
            >
              <ThemedText style={[styles.languageText, selectedLanguage === 'Odia' && { color: 'white' }]}>
                ଓଡ଼ିଆ (Odia)
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView 
          style={styles.chatContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View key={message.id} style={[
                styles.messageWrapper,
                message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
              ]}>
                {!message.isUser && (
                  <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                    <IconSymbol size={16} name="brain.head.profile" color="white" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  message.isUser 
                    ? { backgroundColor: Colors[colorScheme ?? 'light'].primary } 
                    : { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }
                ]}>
                  <ThemedText style={[
                    styles.messageText,
                    message.isUser && { color: 'white' }
                  ]}>
                    {message.text}
                  </ThemedText>
                  {!message.isUser && (
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={() => handleSpeakMessage(message.text)}
                    >
                      <IconSymbol size={16} name="speaker.wave.2" color={Colors[colorScheme ?? 'light'].primary} />
                      <ThemedText style={styles.playText}>Play in {selectedLanguage}</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Suggested Questions */}
          <ScrollView horizontal style={styles.suggestionsContainer} showsHorizontalScrollIndicator={false}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}
                onPress={() => handleSuggestedQuestion(question)}
              >
                <ThemedText style={styles.suggestionText}>{question}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
              <TouchableOpacity style={styles.micButton}>
                <IconSymbol size={20} name="mic" color={Colors[colorScheme ?? 'light'].primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Type your farming question here..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleSendMessage}
              >
                <IconSymbol size={20} name="paperplane.fill" color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  assistantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 8,
  },
  assistantTitle: {
    color: 'white',
    fontWeight: '600',
  },
  assistantSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  languageSection: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  playText: {
    fontSize: 12,
    opacity: 0.7,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  inputContainer: {
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  micButton: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});