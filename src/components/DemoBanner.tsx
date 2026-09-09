import React, { useState } from 'react';
import {
  Sparkles, Zap, Flame, Download, RotateCcw,
  ExternalLink, ChevronUp, ChevronDown
} from 'lucide-react';
import { mockEngine, ScenarioType } from '../services/mockEngine';
import { useAuth } from '../context/AuthContext';

export const DemoBanner: React.FC = () => {
  const { user, setRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('normal');

  const handleScenario = (scenario: ScenarioType) => {
    mockEngine.setScenario(scenario);
    setActiveScenario(scenario);
  };

  return (
    <div className="bg-gradient-to-r from-brand-700 via-indigo-900 to-surface-900 border-b border-brand-500/30 text-white text-xs z-40 sticky top-0 transition-all duration-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator & Host Context */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-400/30 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wide text-brand-100">Live Interactive Demo</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IN-BROWSER SIMULATION
              </span>
            </div>
            {!isCollapsed && (
              <p className="text-[11px] text-indigo-200/80 font-mono hidden sm:block">
                Simulating Ubuntu 24.04 LTS • Intel Core i7-13700H (16 Cores) • 32 GB DDR5 • 2 TB NVMe
              </p>
            )}
          </div>
        </div>

        {/* Middle: Scenario Trigger Buttons */}
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-300 font-medium mr-1 hidden md:inline">Scenarios:</span>
            
            <button
              onClick={() => handleScenario('cpu_spike')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                activeScenario === 'cpu_spike'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-surface-800/80 hover:bg-surface-700 text-slate-200 border border-surface-600/50'
              }`}
              title="Push simulated CPU load to 95% across all 16 cores"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Spike CPU (95%)</span>
            </button>

            <button
              onClick={() => handleScenario('thermal_alert')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                activeScenario === 'thermal_alert'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-surface-800/80 hover:bg-surface-700 text-slate-200 border border-surface-600/50'
              }`}
              title="Trigger high temperature alert at 88°C"
            >
              <Flame className="w-3 h-3 text-rose-300" />
              <span>Thermal Alert (88°C)</span>
            </button>

            <button
              onClick={() => handleScenario('network_burst')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                activeScenario === 'network_burst'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-surface-800/80 hover:bg-surface-700 text-slate-200 border border-surface-600/50'
              }`}
              title="Simulate 1 Gbps high bandwidth network download burst"
            >
              <Download className="w-3 h-3 text-cyan-300" />
              <span>Network Burst</span>
            </button>

            <button
              onClick={() => handleScenario('normal')}
              className="px-2 py-1 rounded text-[11px] font-medium bg-surface-800/80 hover:bg-surface-700 text-slate-300 border border-surface-600/50 flex items-center gap-1 transition-colors"
              title="Reset simulation to default steady baseline"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Right: Role Switcher & GitHub Repo Link */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher */}
          {!isCollapsed && user && (
            <div className="flex items-center bg-surface-900/80 p-0.5 rounded-lg border border-surface-700 text-[11px]">
              <button
                onClick={() => setRole('admin')}
                className={`px-2 py-0.5 rounded font-mono ${
                  user.role === 'admin' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
                title="Admin role allows rebooting and service/process control"
              >
                Admin
              </button>
              <button
                onClick={() => setRole('read_only')}
                className={`px-2 py-0.5 rounded font-mono ${
                  user.role === 'read_only' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
                title="Read-only role disables state-mutating buttons"
              >
                Viewer
              </button>
            </div>
          )}

          {/* GitHub Project Link */}
          <a
            href="https://github.com/motharak/ServerDashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors border border-white/15"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">Source Code</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </a>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-300 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Demo Controls' : 'Collapse Demo Banner'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
