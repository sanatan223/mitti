import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
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
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [conversationHistory, setConversationHistory] = useState([
    {
      role: 'system',
      content: `
        You are "Saathi AI", an agricultural expert who helps farmers analyze soil and gives advice.
        You should always remember the previous soil analysis and refer to it if user asks follow-up questions.
        Keep tone friendly, structured, and easy to read aloud.
      `
    }
  ]);


  const soilData = {
    ph: 5.2,
    moisture: 22,
    nitrogen: 18,
    phosphorus: 35,
    potassium: 15,
    organic_matter: 2.1,
  };

  // 🔹 Unified AI call (used by both soil analysis & chat)
  const sendToAI = async (newUserMessage: string) => {
    try {
      const updatedHistory = [...conversationHistory, { role: 'user', content: newUserMessage }];
      setConversationHistory(updatedHistory);

      const tempMessageId = Date.now();
      const loadingMessage: Message = {
        id: tempMessageId,
        text: 'Thinking...',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, loadingMessage]);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: updatedHistory,
        }),
      });

      const data = await response.json();
      const aiText = data?.choices?.[0]?.message?.content ?? 'Sorry, no response.';

      const aiMessage = { id: tempMessageId, text: aiText, isUser: false, timestamp: new Date() };
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessageId ? aiMessage : msg))
      );
      
      setConversationHistory((prev) => [...prev, { role: 'assistant', content: aiText }]);

      handleSpeakMessage(aiText);
    } catch (error) {
      console.error('AI Error:', error);
      Alert.alert('Error', 'Failed to get AI response.');
    }
  };

  // 🔹 Generate initial soil analysis
  const handleGetSuggestion = async () => {
    const prompt = `
    Analyze the following soil data and give a spoken expert analysis.
    Include: 
    1. Soil type (acidic/basic/neutral)
    2. Nutrient deficiencies
    3. Recommendations to improve quality
    4. Best crops to grow
    5. Speak like an expert guiding a farmer in ${selectedLanguage}.

    ${JSON.stringify(soilData)}
    `;

    await sendToAI(prompt);
  };

  // 🔹 User sends a chat message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage: Message = {
      id: Date.now() + Math.random(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const question = inputText.trim();
    setInputText('');
    await sendToAI(question);
  };


  const handleSpeakMessage = async (text: string) => {
    const currentlySpeaking = await Speech.isSpeakingAsync();

    if (currentlySpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    Speech.speak(text, {
      language: selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-US',
      pitch: 1.0,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].primary }}>
      <ThemedView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View
            style={[
              styles.assistantBadge,
              { backgroundColor: Colors[colorScheme ?? 'light'].primary },
            ]}
          >
            <IconSymbol size={24} name="brain.head.profile" color="white" />
            <ThemedText style={styles.assistantTitle}>Saathi AI Assistant</ThemedText>
          </View>

          <TouchableOpacity
            style={[
              styles.assistantBadge,
              { backgroundColor: Colors[colorScheme ?? 'light'].primary },
            ]}
            onPress={handleGetSuggestion}
          >
            <IconSymbol size={24} name="leaf" color="white" />
            <ThemedText style={styles.assistantTitle}>Analyze Soil</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.assistantSubtitle}>
            Ask me anything about soil health and farming.
          </ThemedText>

          {/* LANGUAGE SWITCHER */}
          <View style={styles.languageSection}>
            {['English', 'Hindi', 'Odia'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      selectedLanguage === lang
                        ? Colors[colorScheme ?? 'light'].primary
                        : Colors[colorScheme ?? 'light'].lightGray,
                  },
                ]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <ThemedText
                  style={[
                    styles.languageText,
                    selectedLanguage === lang && { color: 'white' },
                  ]}
                >
                  {lang === 'English'
                    ? 'English'
                    : lang === 'Hindi'
                    ? 'हिंदी (Hindi)'
                    : 'ଓଡ଼ିଆ (Odia)'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CHAT */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
                ]}
              >
                {!message.isUser && (
                  <View
                    style={[
                      styles.avatarContainer,
                      { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                    ]}
                  >
                    <IconSymbol size={16} name="brain.head.profile" color="white" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser
                      ? { backgroundColor: Colors[colorScheme ?? 'light'].primary }
                      : { backgroundColor: Colors[colorScheme ?? 'light'].lightGray },
                  ]}
                >
                  {message.text === 'Thinking...' ? (
                    <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
                  ) : (
                    <ThemedText
                      style={[styles.messageText, message.isUser && { color: 'white' }]}
                    >
                      {message.text}
                    </ThemedText>
                  )}

                  {!message.isUser && (
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handleSpeakMessage(message.text)}
                    >
                      <IconSymbol
                        size={16}
                        name="speaker.wave.2"
                        color={Colors[colorScheme ?? 'light'].primary}
                      />
                      <ThemedText style={styles.playText}>
                        {isSpeaking ? 'Stop' : `Play in ${selectedLanguage}`}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* INPUT */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: Colors[colorScheme ?? 'light'].lightGray },
              ]}
            >
              <TouchableOpacity style={styles.micButton}>
                <IconSymbol
                  size={20}
                  name="mic.fill"
                  color={Colors[colorScheme ?? 'light'].primary}
                />
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholder="Type your farming question here..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                ]}
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