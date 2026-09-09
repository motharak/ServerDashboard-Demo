import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DemoBanner } from './components/DemoBanner';
import { api } from './services/api';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { SystemPage } from './pages/SystemPage';
import { CpuRamPage } from './pages/CpuRamPage';
import { StoragePage } from './pages/StoragePage';
import { NetworkPage } from './pages/NetworkPage';
import { PortsPage } from './pages/PortsPage';
import { FirewallPage } from './pages/FirewallPage';
import { ServicesPage } from './pages/ServicesPage';
import { DockerPage } from './pages/DockerPage';
import { ProcessesPage } from './pages/ProcessesPage';
import { LogsPage } from './pages/LogsPage';
import { TemperaturePage } from './pages/TemperaturePage';
import { PowerPage } from './pages/PowerPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Power action confirmation state
  const [powerModal, setPowerModal] = useState<{
    type: 'reboot' | 'shutdown';
    token: string;
    prompt: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center font-mono text-xs text-slate-400">
        Initializing interactive demo environment...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleTriggerReboot = async () => {
    try {
      const res = await api.requestReboot();
      setPowerModal({
        type: 'reboot',
        token: res.token,
        prompt: res.prompt,
      });
    } catch (err: any) {
      alert(err.message || 'Reboot request failed');
    }
  };

  const handleTriggerShutdown = async () => {
    try {
      const res = await api.requestShutdown();
      setPowerModal({
        type: 'shutdown',
        token: res.token,
        prompt: res.prompt,
      });
    } catch (err: any) {
      alert(err.message || 'Shutdown request failed');
    }
  };

  const handleConfirmPower = async () => {
    if (!powerModal) return;
    if (powerModal.type === 'reboot') {
      await api.confirmReboot(powerModal.token);
    } else {
      await api.confirmShutdown(powerModal.token);
    }
  };

  const viewTitles: Record<NavItemKey, string> = {
    dashboard: 'Server Overview',
    system: 'Host Specification',
    'cpu-ram': 'Processor & Memory',
    storage: 'Storage Explorer',
    network: 'Network Throughput',
    ports: 'Listening Port Monitor',
    firewall: 'Firewall & Security',
    services: 'Systemd Services',
    docker: 'Docker Containers',
    processes: 'Process Management',
    logs: 'System Logs',
    temperature: 'Thermal Sensors',
    power: 'Power & Consumption',
    alerts: 'Notification Center',
    settings: 'Settings & Rates',
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col">
      {/* Top Interactive Demo Banner */}
      <DemoBanner />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <Header
            title={viewTitles[currentView]}
            onTriggerReboot={handleTriggerReboot}
            onTriggerShutdown={handleTriggerShutdown}
          />

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {currentView === 'dashboard' && <DashboardPage onNavigate={setCurrentView} />}
            {currentView === 'system' && <SystemPage />}
            {currentView === 'cpu-ram' && <CpuRamPage />}
            {currentView === 'storage' && <StoragePage />}
            {currentView === 'network' && <NetworkPage />}
            {currentView === 'ports' && <PortsPage />}
            {currentView === 'firewall' && <FirewallPage />}
            {currentView === 'services' && <ServicesPage />}
            {currentView === 'docker' && <DockerPage />}
            {currentView === 'processes' && <ProcessesPage />}
            {currentView === 'logs' && <LogsPage />}
            {currentView === 'temperature' && <TemperaturePage />}
            {currentView === 'power' && <PowerPage />}
            {currentView === 'alerts' && <AlertsPage />}
            {currentView === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>

      {/* Confirmation Modal for Server Reboot / Shutdown */}
      {powerModal && (
        <ConfirmationModal
          isOpen={true}
          title={powerModal.type === 'reboot' ? 'Confirm Server Reboot (Simulated)' : 'Confirm Server Shutdown (Simulated)'}
          prompt={powerModal.prompt}
          confirmLabel={powerModal.type === 'reboot' ? 'Reboot Now' : 'Power Off Now'}
          isDangerous={true}
          onConfirm={handleConfirmPower}
          onClose={() => setPowerModal(null)}
        />
      )}
    </div>
  );
};
