import React from 'react';
import { HardDrive, AlertTriangle, ShieldCheck, ArrowDown, ArrowUp, Thermometer } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';
import { ProgressBar } from '../components/ProgressBar';

export const StoragePage: React.FC = () => {
  const { snapshot } = useMetrics();
  if (!snapshot) return null;
  const { storage } = snapshot;

  return (
    <div className="space-y-6">
      {/* Overview Notice */}
      <div className="card-subtle flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-brand-500" />
          <span>Real mount points polled via <code className="text-slate-200">statvfs()</code> and <code className="text-slate-200">/proc/mounts</code></span>
        </div>
        <span className="font-mono">{storage.disks.length} File Systems Detected</span>
      </div>

      {/* Disks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {storage.disks.map((disk) => {
          const usedGb = (disk.used_bytes / (1024 ** 3)).toFixed(1);
          const totalGb = (disk.total_bytes / (1024 ** 3)).toFixed(1);
          const freeGb = (disk.free_bytes / (1024 ** 3)).toFixed(1);

          const readMb = disk.read_speed_bytes_sec ? (disk.read_speed_bytes_sec / (1024 * 1024)).toFixed(1) : '0.0';
          const writeMb = disk.write_speed_bytes_sec ? (disk.write_speed_bytes_sec / (1024 * 1024)).toFixed(1) : '0.0';

          return (
            <div key={disk.mountpoint} className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-mono">{disk.mountpoint}</h3>
                    <span className="badge-slate text-[10px] font-mono">{disk.fstype}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">{disk.device}</p>
                </div>

                <span className={`badge-${disk.warning_level === 'critical' ? 'rose' : disk.warning_level === 'warning' ? 'amber' : 'emerald'} font-mono`}>
                  {disk.usage_pct}%
                </span>
              </div>

              {/* Progress Bar with 70/85/95 thresholds */}
              <div className="space-y-1">
                <ProgressBar value={disk.usage_pct} size="md" />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{usedGb} GB used</span>
                  <span>{freeGb} GB free ({totalGb} GB Total)</span>
                </div>
              </div>

              {/* Disk Metrics & Telemetry */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface-300/30 text-center font-mono text-xs">
                {/* Read / Write Throughput */}
                <div className="p-2 rounded-lg bg-surface-50/50">
                  <span className="text-[10px] text-slate-400 block uppercase">Throughput</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5 text-slate-200">
                    <ArrowDown className="w-3 h-3 text-cyan-400" />
                    <span className="text-[11px]">{readMb} MB/s</span>
                  </div>
                </div>

                {/* Disk Temperature */}
                <div className="p-2 rounded-lg bg-surface-50/50">
                  <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5 text-slate-200">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px]">{disk.temperature_c ? `${disk.temperature_c}°C` : 'N/A'}</span>
                  </div>
                </div>

                {/* SMART Status */}
                <div className="p-2 rounded-lg bg-surface-50/50">
                  <span className="text-[10px] text-slate-400 block uppercase">SMART</span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">
                    {disk.smart_status || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Warning alert if > 70% */}
              {disk.usage_pct >= 70 && (
                <div className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono ${
                  disk.usage_pct >= 95
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    : disk.usage_pct >= 85
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Storage threshold reached ({disk.usage_pct}% &gt;= {disk.usage_pct >= 95 ? '95%' : disk.usage_pct >= 85 ? '85%' : '70%'})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
