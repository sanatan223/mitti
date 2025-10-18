import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SoilData, SoilTestRecord, getTestRecords } from '../../database/datastorage'; 

// Define the shape of the context state
interface SoilTestContextType {
  latestRecordId: string | null;
  setLatestRecordId: (id: string | null) => void;
  latestSoilData: SoilData | null;
  setLatestSoilData: (data: SoilData | null) => void;
  // A function to trigger re-fetch in History (for focus listeners)
  triggerHistoryRefresh: number;
  setTriggerHistoryRefresh: (value: number) => void; 
}

// Create the Context with default values
const SoilTestContext = createContext<SoilTestContextType | undefined>(undefined);

// Define the Provider component
interface SoilTestProviderProps {
  children: ReactNode;
}

export const SoilTestProvider: React.FC<SoilTestProviderProps> = ({ children }) => {
  const [latestRecordId, setLatestRecordId] = useState<string | null>(null);
  const [latestSoilData, setLatestSoilData] = useState<SoilData | null>(null);
  const [triggerHistoryRefresh, setTriggerHistoryRefresh] = useState(0); // Simple counter to force refresh

  return (
    <SoilTestContext.Provider 
      value={{ 
        latestRecordId, 
        setLatestRecordId, 
        latestSoilData, 
        setLatestSoilData,
        triggerHistoryRefresh,
        setTriggerHistoryRefresh
      }}
    >
      {children}
    </SoilTestContext.Provider>
  );
};

// Custom hook to use the context
export const useSoilTest = (): SoilTestContextType => {
  const context = useContext(SoilTestContext);
  if (context === undefined) {
    throw new Error('useSoilTest must be used within a SoilTestProvider');
  }
  return context;
};

// Note: You must wrap your main application component (e.g., your <App /> or Navigator)
// with <SoilTestProvider> for this to work.