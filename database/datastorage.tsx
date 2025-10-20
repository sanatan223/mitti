// datastorage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------------------
// 1. TYPE DEFINITIONS
// ------------------------------------

// Soil Data Model (from live-connect.tsx mock)
export interface SoilData {
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  temperature: number;
  ec: number; // electrical conductivity
}

// AI Conversation History Message Model (from ai-chat.tsx)
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Full Test Record Model (to be stored)
export interface SoilTestRecord {
  id: string; // Unique ID for the record (e.g., timestamp)
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM'
  location: string; // User-defined location
  soilData: SoilData;
  chatHistory: ConversationMessage[]; // Conversation log related to this test
  // Additional fields for History screen display
  pHStatus: 'Neutral' | 'Acidic' | 'Alkaline'; 
  pHColor: string;
  latitude: number;
  longitude: number;
}

// ------------------------------------
// 2. CONSTANTS
// ------------------------------------

const STORAGE_KEY = '@SoilTestRecords';

// ------------------------------------
// 3. STORAGE UTILITIES (CRUD)
// ------------------------------------

/**
 * Retrieves all stored soil test records.
 */
export async function getTestRecords(): Promise<SoilTestRecord[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading data from storage:', e);
    return [];
  }
}

/**
 * Saves a new soil test record.
 */
export async function saveTestRecord(newRecord: Omit<SoilTestRecord, 'id' | 'date' | 'time'>, location: string = 'New Test Location'): Promise<SoilTestRecord | null> {
  try {
    const existingRecords = await getTestRecords();
    
    // Create new unique ID and timestamp
    const now = new Date();
    const id = now.getTime().toString();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Determine pH status/color for History screen
    let pHStatus: SoilTestRecord['pHStatus'];
    let pHColor: string;
    if (newRecord.soilData.pH < 6.0) {
        pHStatus = 'Acidic';
        pHColor = '#f44336'; // Red
    } else if (newRecord.soilData.pH > 7.5) {
        pHStatus = 'Alkaline';
        pHColor = '#2196f3'; // Blue
    } else {
        pHStatus = 'Neutral';
        pHColor = '#4CAF50'; // Green (assuming primary is green)
    }

    // Default Geo-coordinates (replace with actual if GPS is used)
    const defaultLatitude = 20.2961 + Math.random() * 0.01;
    const defaultLongitude = 85.8245 + Math.random() * 0.01;


    const recordToSave: SoilTestRecord = {
        ...newRecord,
        id,
        date,
        time,
        location,
        pHStatus,
        pHColor,
        latitude: defaultLatitude,
        longitude: defaultLongitude,
    };
    
    const updatedRecords = [recordToSave, ...existingRecords]; // Newest first
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    return recordToSave;
  } catch (e) {
    console.error('Error saving data to storage:', e);
    return null;
  }
}

/**
 * Updates the chat history for an existing soil test record.
 */
export async function updateTestRecordChatHistory(recordId: string, newChatHistory: ConversationMessage[]): Promise<boolean> {
  try {
    const existingRecords = await getTestRecords();
    const recordIndex = existingRecords.findIndex(r => r.id === recordId);

    if (recordIndex === -1) {
      console.warn(`Record with ID ${recordId} not found.`);
      return false;
    }

    existingRecords[recordIndex].chatHistory = newChatHistory;
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingRecords));
    return true;
  } catch (e) {
    console.error('Error updating chat history:', e);
    return false;
  }
}

/**
 * Retrieves a single test record by ID.
 */
export async function getTestRecordById(recordId: string): Promise<SoilTestRecord | undefined> {
    const records = await getTestRecords();
    return records.find(r => r.id === recordId);
}

/**
 * Clears all test records. (For development/testing)
 */
export async function clearTestRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('All test records cleared.');
  } catch (e) {
    console.error('Error clearing data:', e);
  }
}

export async function clearTestRecordById(recordId: string): Promise<void> {
 try {
    const existingRecords = await getTestRecords();
    const originalLength = existingRecords.length;
    const updatedRecords = existingRecords.filter(r => r.id !== recordId);
    if (updatedRecords.length < originalLength) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
      console.log(`Successfully deleted record with ID: ${recordId}`);
    } else {
      console.warn(`Record with ID ${recordId} not found for deletion.`);
    }
  } catch (e) {
    console.error('Error deleting data from storage:', e);
  }
}

// ------------------------------------
// 4. CONTEXT/HOOK FOR GLOBAL ACCESS (Optional but good practice for larger apps)
// ------------------------------------
/*
// For this simple example, we will just import and use the utility functions
// in the individual screen files, but a global context hook is ideal for
// managing application state changes based on database updates.
*/