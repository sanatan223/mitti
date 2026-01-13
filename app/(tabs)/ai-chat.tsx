import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { useLanguage, Language } from '../context/LanguageContext';
import { SoilData, getAllSoilRecords, getSoilRecordById, getChatHistory, saveChatMessage, ChatMessage, clearChatHistory } from '../../database/datastorage';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import LanguageDropdown from '../../components/Languageselector';

interface AIChatRouteParams {
    recordId?: string; 
}

export default function AIChatScreen() {
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
  const colorScheme = useColorScheme();
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentLanguage, setLanguage, t } = useLanguage(); 
  const [chatSoilData, setChatSoilData] = useState<SoilData | null>(null);
  const route = useRoute();
  const { recordId } = route.params as { recordId?: string } || {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [processedRecordIds, setProcessedRecordIds] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      const loadChatHistory = async() => {
        const history = await getChatHistory();
        setMessages(history);
      };

      const triggerAutoSuggestion = async () => {
        if (recordId && !processedRecordIds.has(recordId)) {
          console.log("🔍 Auto-analyzing record:", recordId);

          const record = await getSoilRecordById(recordId);

          if (record) {
            const prompt = `
                      You are "Saathi AI", an agricultural expert who helps farmers analyze soil and gives advice.
                      You should always remember the previous soil analysis and refer to it if user asks follow-up questions.
                      Keep tone friendly, structured, and easy to read aloud.
                      Your response must be entirely in ${currentLanguage}.
                  `
            const autoPrompt = prompt + `Analyze this soil data from ${new Date(record.dateSaved).toLocaleDateString()}:
            Temp: ${record.data.temp}°C,
            Moisture: ${record.data.moisture}%,
            pH: ${record.data.ph},
            NPK: ${record.data.nitrogen}-${record.data.phosphorus}-${record.data.potassium}.
            Provide recommendations for a farmer.`;

            // Add the user message first
            const userMessage: ChatMessage = {
              id: Date.now() + Math.random(),
              text: "📁 Sent file data for analyzation...",
              isUser: true,
              timestamp: new Date().toISOString(),
            };

            // Update state immediately to show the user message
            setMessages(prev => [...prev, userMessage]);
            await saveChatMessage(userMessage);

            // Then send to AI
            await sendToAI(autoPrompt.trim());

            // Mark this recordId as processed
            setProcessedRecordIds(prev => new Set(prev).add(recordId));
          }
        }
      };

      // Load history first, then trigger auto-suggestion if needed
      loadChatHistory().then(() => {
        triggerAutoSuggestion();
      });
    }, [recordId, processedRecordIds, currentLanguage])
  );

  // Load Test Data and History
  useEffect(() => {
    saveToStorage({
        id: Date.now() + Math.random(),
        text: t('Hello! I\'m your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.'),
        isUser: false,
        timestamp: new Date().toISOString(),
      })
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

const saveToStorage = (newMessage: ChatMessage) => {
  setMessages((prevMessages) => [...prevMessages, newMessage]);
  saveChatMessage(newMessage);
}

const sendToAI = async (newUserMessage: string, isInitialAnalysis: boolean = false) => {
    try {
      const updatedHistory = [messages];

      const tempMessageId = Date.now();
      const loadingMessage:ChatMessage= {
        id: tempMessageId,
        text: 'Thinking...',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, loadingMessage]);
      
      // Build conversation context
      const conversationContext = messages
        .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n\n');
      
      const prompt = isInitialAnalysis ? 
        newUserMessage : // For initial analysis, use the full prompt
        `${conversationContext}\n\nAssistant:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      const data = await response.json();
      console.log('Gemini Response:', data);
      
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, no response from AI.';

      const aiMessage = { 
        id: Date.now() + Math.random(), 
        text: aiText, 
        isUser: false, 
        timestamp: new Date().toISOString() 
      };
      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessageId ? aiMessage : msg))
      );
      const aiResponse:ChatMessage= {
        id: Date.now() + Math.random(),
        text: aiText.trim(),
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      await saveChatMessage(aiResponse);

      handleSpeakMessage(aiText);
    } catch (error) {
      console.error('Gemini AI Error:', error);
      Alert.alert('Error', 'Failed to get AI response from Gemini.');
    }
  };


  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now() + Math.random(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    await saveChatMessage(userMessage);
    const question = textToSend.trim();
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
      language: currentLanguage === 'Hindi' ?
       'hi-IN' :
        currentLanguage === 'Odia'?
        'or-IN':
        'en-US',
      pitch: 1.0,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const clearMessages = () => {
    clearChatHistory();
    setMessages([]);
    saveToStorage({
      id: Date.now() + Math.random(),
      text: t('Hello! I\'m your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.'),
      isUser: false,
      timestamp: new Date().toISOString(),
    })
  }

  const languages: Language[] = ['English', 'Odia', 'Hindi'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].primary, paddingBottom: -40 }}>
        <ThemedView style={styles.container}>
          <LanguageDropdown />
          
          {/* HEADER */}
          <View style={styles.header}>
            <View
              style={[
                styles.assistantBadge,
                { backgroundColor: Colors[colorScheme ?? 'light'].primary },
              ]}
            >
              <IconSymbol size={24} name="brain.head.profile" color="white" />
              <ThemedText style={styles.assistantTitle}>{t('Saathi AI Assistant')}</ThemedText>
            </View>
            <TouchableOpacity
            onPress={clearMessages}
            >
              <ThemedText>
                Clear Messages
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* CHAT */}
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
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
                          {isSpeaking ? 'Stop' : `Play in ${currentLanguage}`}
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
                  placeholder={t('Type your question or command...')} 
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                  ]}
                  onPress={() => {handleSendMessage()}}
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
