import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Clock, BarChart3 } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';
import { ProgressBar } from '../components/ProgressBar';
import { api } from '../services/api';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export const CpuRamPage: React.FC = () => {
  const { snapshot } = useMetrics();
  const [rangeWindow, setRangeWindow] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getHistory(rangeWindow);
        setHistoryData(res.data);
      } catch (err) {
        console.error('Failed to load metric history', err);
      }
    }
    loadHistory();
    const interval = setInterval(loadHistory, 10000);
    return () => clearInterval(interval);
  }, [rangeWindow]);

  if (!snapshot) return null;
  const { cpu, memory } = snapshot;

  const ramUsedGb = (memory.used_bytes / (1024 ** 3)).toFixed(2);
  const ramTotalGb = (memory.total_bytes / (1024 ** 3)).toFixed(2);
  const ramAvailGb = (memory.available_bytes / (1024 ** 3)).toFixed(2);
  const ramCachedGb = (memory.cached_bytes / (1024 ** 3)).toFixed(2);
  const swapUsedGb = (memory.swap_used_bytes / (1024 ** 3)).toFixed(2);
  const swapTotalGb = (memory.swap_total_bytes / (1024 ** 3)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Summary */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-white">Processor Profile</h3>
            </div>
            <span className="badge-cyan font-mono">{cpu.usage_pct}% Overall</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-100 font-mono">{cpu.model}</h4>
            <p className="text-xs text-slate-400 font-mono">
              {cpu.physical_cores} Physical Cores • {cpu.total_cores} Logical Threads
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-300/30 text-center font-mono">
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">1m Load</span>
              <span className="text-sm font-bold text-slate-200">{cpu.load_avg[0] || '0.00'}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">5m Load</span>
              <span className="text-sm font-bold text-slate-200">{cpu.load_avg[1] || '0.00'}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">15m Load</span>
              <span className="text-sm font-bold text-slate-200">{cpu.load_avg[2] || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* RAM Summary */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Memory Allocation</h3>
            </div>
            <span className="badge-emerald font-mono">{memory.usage_pct}% Allocated</span>
          </div>

          <ProgressBar value={memory.usage_pct} size="md" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center font-mono text-xs">
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">Used</span>
              <span className="text-xs font-bold text-slate-200">{ramUsedGb} GB</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">Available</span>
              <span className="text-xs font-bold text-emerald-400">{ramAvailGb} GB</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">Cached</span>
              <span className="text-xs font-bold text-slate-300">{ramCachedGb} GB</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-50/50">
              <span className="text-[10px] text-slate-400 block uppercase">Total</span>
              <span className="text-xs font-bold text-slate-200">{ramTotalGb} GB</span>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-300/30 flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Swap: {swapUsedGb} GB / {swapTotalGb} GB</span>
            <span className="badge-slate text-[10px]">{memory.swap_pct}%</span>
          </div>
        </div>
      </div>

      {/* Per-Core Breakdown Grid */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-white">Per-Core CPU Utilization ({cpu.per_core.length} vCPUs)</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cpu.per_core.map((core) => (
            <div key={core.core_id} className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold">Core {core.core_id}</span>
                <span className="text-brand-400 font-bold">{core.usage_pct}%</span>
              </div>
              <ProgressBar value={core.usage_pct} size="sm" />
              {core.freq_mhz && (
                <p className="text-[10px] text-slate-400 font-mono text-right">{core.freq_mhz} MHz</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Historical Telemetry Chart */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-white">Historical Telemetry Timeline</h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono">
            {(['1h', '6h', '24h', '7d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setRangeWindow(range)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  rangeWindow === range
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {historyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
              Recording live metrics...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262d37" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="mono" />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" fontStyle="mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181b20', borderColor: '#323a46', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cpu_usage" name="CPU Usage %" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                <Area type="monotone" dataKey="ram_usage" name="RAM Usage %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
