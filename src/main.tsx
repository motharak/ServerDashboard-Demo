import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { MetricsProvider } from './context/MetricsContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <MetricsProvider>
        <AppContent />
      </MetricsProvider>
    </AuthProvider>
  </React.StrictMode>
);
