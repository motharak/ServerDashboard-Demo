import React from 'react';
import {
  LayoutDashboard, Server, Cpu, HardDrive, Network,
  Radio, Shield, Layers, Boxes, Activity,
  FileText, Thermometer, Zap, Bell, Settings,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'system'
  | 'cpu-ram'
  | 'storage'
  | 'network'
  | 'ports'
  | 'firewall'
  | 'services'
  | 'docker'
  | 'processes'
  | 'logs'
  | 'temperature'
  | 'power'
  | 'alerts'
  | 'settings';

interface SidebarProps {
  currentView: NavItemKey;
  onSelectView: (view: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  alertsCount?: number;
}

interface NavEntry {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  alertsCount = 0,
}) => {
  const navItems: NavEntry[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'system', label: 'System', icon: Server },
    { key: 'cpu-ram', label: 'CPU & RAM', icon: Cpu },
    { key: 'storage', label: 'Storage', icon: HardDrive },
    { key: 'network', label: 'Network', icon: Network },
    { key: 'ports', label: 'Ports', icon: Radio },
    { key: 'firewall', label: 'Firewall', icon: Shield },
    { key: 'services', label: 'Services', icon: Layers },
    { key: 'docker', label: 'Docker', icon: Boxes },
    { key: 'processes', label: 'Processes', icon: Activity },
    { key: 'logs', label: 'Logs', icon: FileText },
    { key: 'temperature', label: 'Temperature', icon: Thermometer },
    { key: 'power', label: 'Power', icon: Zap },
    { key: 'alerts', label: 'Alerts', icon: Bell, badge: alertsCount > 0 ? alertsCount : undefined },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-surface-900/95 border-r border-surface-300/30 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-300/30">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">Home Server</h1>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Management Hub</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 mx-auto rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-200/50 transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-brand-500/15 text-brand-500 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-200/40'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}

              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-surface-900" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Expand Button if Collapsed */}
      {isCollapsed && (
        <div className="p-3 border-t border-surface-300/30 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-200/50"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
