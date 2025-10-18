import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { useLanguage, Language } from '../context/LanguageContext';
import { getTestRecords, SoilData, ConversationMessage, updateTestRecordChatHistory, getTestRecordById } from '../../database/datastorage';
import { useSoilTest, SoilTestProvider } from '../context/SoilTestContext'; // 👈 Import Context Hook
import { useRoute } from '@react-navigation/native';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Define the route params (for context)
interface AIChatRouteParams {
    recordId?: string; 
}

export default function AIChatScreen() {

  const colorScheme = useColorScheme();
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentLanguage, setLanguage, t } = useLanguage(); 
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null); // State for the active record ID
  const [chatSoilData, setChatSoilData] = useState<SoilData | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { latestRecordId } = useSoilTest(); // 👈 Get the latest ID from context

  // Placeholder for getting navigation params (in a real app, use useRoute())
  const route = useRoute();
  const { recordId: recordIdFromRoute } = route.params as AIChatRouteParams || {}; 
  // For this context, we will mock getting the recordId
  

  // Load Test Data and History
  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoadingHistory(true);
        let recordToUse;
        let finalRecordId = recordIdFromRoute || latestRecordId;

        if (finalRecordId) {
            // Load specific record from History screen OR the latest one from Live Connect
            recordToUse = await getTestRecordById(finalRecordId);
            setCurrentRecordId(finalRecordId);
        } else {
            // Fallback: load the absolute last one if context is stale (e.g. app reloaded)
            const records = await getTestRecords();
            if (records.length > 0) {
                recordToUse = records[0];
                setCurrentRecordId(records[0].id);
            }
        }

        if (recordToUse) {
            setChatSoilData(recordToUse.soilData);
            
            // Set chat history from the record
            const initialMessages: Message[] = recordToUse.chatHistory
                .filter(m => m.role !== 'system')
                .map((msg, index) => ({
                    id: index + 2, // Start ID after the welcome message
                    text: msg.content,
                    isUser: msg.role === 'user',
                    timestamp: new Date(),
                }));
            
            setMessages([
                {
                    id: 1,
                    text: t('Hello! I\'m your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.'),
                    isUser: false,
                    timestamp: new Date(),
                },
                ...initialMessages,
            ]);

            // Set conversation history including system prompt
            const systemPrompt: ConversationMessage = {
                role: 'system',
                content: `
                    You are "Saathi AI", an agricultural expert who helps farmers analyze soil and gives advice.
                    You should always remember the previous soil analysis and refer to it if user asks follow-up questions.
                    Keep tone friendly, structured, and easy to read aloud.
                    Your response must be entirely in ${currentLanguage}.
                `
            };
            setConversationHistory([systemPrompt, ...recordToUse.chatHistory]);

        } else {
            // No saved data, use default/mock setup
            setCurrentRecordId(null);
            setChatSoilData({ ph: 5.2, moisture: 22, nitrogen: 18, phosphorus: 35, potassium: 15, organic_matter: 2.1 } as unknown as SoilData);
            // Default welcome message setup (as was originally)
            setMessages([
                {
                    id: 1,
                    text: t('Hello! I\'m your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.'),
                    isUser: false,
                    timestamp: new Date(),
                },
            ]);
            setConversationHistory([{
                role: 'system',
                content: `
                    You are "Saathi AI", an agricultural expert who helps farmers analyze soil and gives advice.
                    You should always remember the previous soil analysis and refer to it if user asks follow-up questions.
                    Keep tone friendly, structured, and easy to read aloud.
                    Your response must be entirely in ${currentLanguage}.
                `
            }]);
        }
        setIsLoadingHistory(false);
    };

    loadInitialData();
  }, [recordIdFromRoute, latestRecordId, currentLanguage, t]); // Re-run if navigation params or language changes

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  useEffect(() => {
    // 3. Update the system prompt whenever currentLanguage changes
    setConversationHistory(prevHistory => {
    // Note: 'role' is explicitly defined as the literal string "system"
    const newSystemPrompt: ConversationMessage = {
        role: 'system', // This is the key change
        content: `You are "Saathi AI", an agricultural expert who helps farmers analyze soil and gives advice. Crucially, you MUST respond in the language specified by the user: ${currentLanguage}. Your response must be entirely in ${currentLanguage}. You should always remember the previous soil analysis and refer to it if user asks follow-...`,
    };

    // Replace the old system prompt (assuming it's the first element)
    if (prevHistory.length > 0 && prevHistory[0].role === 'system') {
        return [newSystemPrompt, ...prevHistory.slice(1)];
    }
    return [newSystemPrompt, ...prevHistory];
  });
    
    // 4. Update the welcome message to refresh dynamically (optional but good UX)
    setMessages(prevMessages => {
        if (prevMessages.length > 0 && prevMessages[0].id === 1 && !prevMessages[0].isUser) {
             return [{
                 id: 1,
                 text: t("Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English."),
                 isUser: false,
                 timestamp: new Date(),
             }, ...prevMessages.slice(1)];
        }
        return prevMessages;
    });


  }, [currentLanguage, t]);

  // 🔹 Unified AI call (used by both soil analysis & chat)
  const sendToAI = async (newUserMessage: string, isInitialAnalysis: boolean = false) => {
    try {
      const updatedHistory = [...conversationHistory, { role: 'user' as const, content: newUserMessage }];
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
      
      const finalConversationHistory = [...updatedHistory, { role: 'assistant' as const, content: aiText }];
      setConversationHistory(finalConversationHistory);
      // 5. NEW: Persist updated chat history to AsyncStorage
      if (currentRecordId) {
          await updateTestRecordChatHistory(currentRecordId, finalConversationHistory);
      } else if (isInitialAnalysis) {
          Alert.alert("Data Error", "Cannot save chat. No soil data record found. Go to 'Live Connect' to save a record first.");
      }

      handleSpeakMessage(aiText);
    } catch (error) {
      console.error('AI Error:', error);
      Alert.alert('Error', 'Failed to get AI response.');
    }
  };

  // 🔹 Generate initial soil analysis
  const handleGetSuggestion = async () => {
    if (!chatSoilData) {
        Alert.alert("Error", "No soil data available for analysis. Connect to a device or load mock data first.");
        return;
    }
    const prompt = `
    Analyze the following soil data and give a spoken expert analysis.
    Include: 
    1. Soil type (acidic/basic/neutral)
    2. Nutrient deficiencies
    3. Recommendations to improve quality
    4. Best crops to grow
    5. Speak like an expert guiding a farmer in ${currentLanguage}.

    ${JSON.stringify(chatSoilData)}
    `;

    await sendToAI(prompt, true);
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

  const languages: Language[] = ['English', 'Odia', 'Hindi'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].primary }}>
      <SoilTestProvider>
        <ThemedView style={styles.container}>
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
              style={[
                styles.assistantBadge,
                { backgroundColor: Colors[colorScheme ?? 'light'].primary },
              ]}
              onPress={handleGetSuggestion}
            >
              <IconSymbol size={24} name="leaf" color="white" />
              <ThemedText style={styles.assistantTitle}>{t('Analyze Soil')}</ThemedText>
            </TouchableOpacity>
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
                  onPress={handleSendMessage}
                >
                  <IconSymbol size={20} name="paperplane.fill" color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
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