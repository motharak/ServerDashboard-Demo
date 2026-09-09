import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LiveDashboardSnapshot } from '../types';
import { mockEngine } from '../services/mockEngine';
import { useAuth } from './AuthContext';

interface MetricsContextType {
  snapshot: LiveDashboardSnapshot | null;
  isConnected: boolean;
  isInitialLoading: boolean;
  refresh: () => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<LiveDashboardSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchSnapshot = useCallback(async () => {
    if (!user) return;
    const data = mockEngine.generateSnapshot();
    setSnapshot(data);
    setIsInitialLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSnapshot(null);
      setIsConnected(false);
      return;
    }

    setIsConnected(true);
    setIsInitialLoading(false);

    // Subscribe to simulated real-time telemetry ticks from mockEngine
    const unsubscribe = mockEngine.subscribe((newSnapshot) => {
      setSnapshot(newSnapshot);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <MetricsContext.Provider value={{ snapshot, isConnected, isInitialLoading, refresh: fetchSnapshot }}>
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) throw new Error('useMetrics must be used within a MetricsProvider');
  return context;
};
