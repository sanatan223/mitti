import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@agni_soil_records';

export interface SoilData {
  temp: number;
  moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  conductivity: number;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  }
}

export interface SoilTestRecord {
  id: string;
  data: SoilData;
  dateSaved: string;
}

export const saveSoilRecord = async (soilData: SoilData): Promise<boolean> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const records: SoilTestRecord[] = existingData ? JSON.parse(existingData) : [];

    const newRecord: SoilTestRecord = {
      id: `RE-${Date.now()}`,
      data: soilData,
      dateSaved: new Date().toISOString(),
    };

    const updatedRecords = [newRecord, ...records];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    return true;
  } catch (error) {
    console.error("Database Save Error:", error);
    return false;
  }
};

export const getAllSoilRecords = async (): Promise<SoilTestRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Database Get All Error:", error);
    return [];
  }
};

export const getSoilRecordById = async (id: string): Promise<SoilTestRecord | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const records: SoilTestRecord[] = JSON.parse(data);
    const found = records.find((record) => record.id === id);
    
    return found || null;
  } catch (error) {
    console.error("Database Get By ID Error:", error);
    return null;
  }
};

export const clearAllRecords = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

