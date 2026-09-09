import React, { useState } from 'react';
import {
  RotateCcw, Power, ShieldAlert, Wifi, WifiOff,
  LogOut, User as UserIcon, Activity, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMetrics } from '../context/MetricsContext';

interface HeaderProps {
  title: string;
  onTriggerReboot: () => void;
  onTriggerShutdown: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTriggerReboot,
  onTriggerShutdown,
}) => {
  const { user, logout } = useAuth();
  const { snapshot, isConnected } = useMetrics();
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);

  const healthScore = snapshot?.health.overall_score ?? 100;
  const hostname = snapshot?.system.hostname || 'Home';
  const uptime = snapshot?.system.uptime_human || '—';

  return (
    <header className="h-16 bg-surface-900/80 border-b border-surface-300/30 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: View Title & Host Status */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-surface-300/30 text-xs text-slate-400">
          <span className="font-medium text-slate-300">{hostname}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>Uptime: <span className="text-slate-300 font-mono">{uptime}</span></span>
        </div>
      </div>

      {/* Right: Metrics, Controls, Auth */}
      <div className="flex items-center gap-3">
        {/* Real-time Connection Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
          title={isConnected ? 'Live WebSocket streaming active' : 'Connecting to real-time telemetry stream'}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
              <span className="hidden sm:inline">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="hidden sm:inline">POLLING</span>
            </>
          )}
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-100/70 border border-surface-300/40 text-xs">
          <Activity className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-slate-400 hidden sm:inline">Health:</span>
          <span className={`font-semibold font-mono ${
            healthScore >= 90 ? 'text-emerald-400' : healthScore >= 75 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {healthScore}/100
          </span>
        </div>

        {/* Server Power Controls (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="relative">
            <button
              onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-surface-200/50 hover:bg-surface-200 border border-surface-300/40 transition-colors"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Power</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPowerMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-100 border border-surface-300/50 rounded-xl shadow-2xl py-1 z-50">
                <button
                  onClick={() => {
                    setIsPowerMenuOpen(false);
                    onTriggerReboot();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-surface-200/60 transition-colors text-left"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Reboot Server</span>
                </button>
                <button
                  onClick={() => {
                    setIsPowerMenuOpen(false);
                    onTriggerShutdown();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left border-t border-surface-300/30"
                >
                  <Power className="w-4 h-4 text-rose-400" />
                  <span>Shutdown Server</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* User & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-300/30">
          <div className="hidden lg:flex flex-col text-right text-xs">
            <span className="font-medium text-slate-200 leading-none">{user?.username}</span>
            <span className="text-[10px] text-brand-500 font-mono uppercase">{user?.role}</span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
