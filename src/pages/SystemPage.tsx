import React from 'react';
import { Server, Cpu, HardDrive, Network, Globe, Clock, ShieldCheck, Activity } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export const SystemPage: React.FC = () => {
  const { snapshot } = useMetrics();
  if (!snapshot) return null;
  const { system, cpu, memory, health } = snapshot;

  const totalRamGb = (memory.total_bytes / (1024 ** 3)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Host Specs Grid */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-500" />
          <h3 className="text-sm font-semibold text-white">Server Host Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Hostname</span>
            <p className="text-slate-100 font-bold text-sm">{system.hostname}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Operating System</span>
            <p className="text-slate-100 font-bold text-sm">{system.os_name}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Linux Kernel</span>
            <p className="text-slate-100 font-bold text-sm">{system.kernel}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Processor Model</span>
            <p className="text-slate-100 font-bold">{cpu.model}</p>
            <p className="text-[10px] text-slate-400">{cpu.physical_cores} Cores / {cpu.total_cores} Threads</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Installed RAM</span>
            <p className="text-slate-100 font-bold">{totalRamGb} GB</p>
            <p className="text-[10px] text-slate-400">{memory.usage_pct}% Currently in Use</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">System Uptime</span>
            <p className="text-slate-100 font-bold text-sm">{system.uptime_human}</p>
            <p className="text-[10px] text-slate-400">{system.current_time}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">LAN IP Address</span>
            <p className="text-slate-100 font-bold text-sm">{system.server_ip}</p>
            <p className="text-[10px] text-slate-400">Interface: {system.primary_interface}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Internet Connectivity</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${system.internet_connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <p className="text-slate-100 font-bold">
                {system.internet_connected ? 'Connected (WAN Online)' : 'Disconnected'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-50/50 border border-surface-300/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Overall Health Score</span>
            <p className="text-emerald-400 font-bold text-sm">{health.overall_score} / 100</p>
          </div>
        </div>
      </div>
    </div>
  );
};
