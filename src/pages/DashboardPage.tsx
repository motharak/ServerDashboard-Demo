import React from 'react';
import {
  Cpu, HardDrive, Zap, Network, Layers,
  Boxes, Radio, Activity, CheckCircle2, AlertTriangle,
  Flame, Server, ArrowDown, ArrowUp, RefreshCw, Terminal
} from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';
import { MetricCard } from '../components/MetricCard';
import { ProgressBar } from '../components/ProgressBar';
import { NavItemKey } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (view: NavItemKey) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { snapshot, isInitialLoading, refresh } = useMetrics();

  if (isInitialLoading || !snapshot) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm text-slate-400 font-mono">Connecting to system telemetry stream...</p>
        </div>
      </div>
    );
  }

  const { system, cpu, memory, storage, temperature, power, network, health, top_services, docker, ssh } = snapshot;

  const totalStorageBytes = storage.disks.reduce((acc, d) => acc + d.total_bytes, 0);
  const usedStorageBytes = storage.disks.reduce((acc, d) => acc + d.used_bytes, 0);
  const storagePct = totalStorageBytes > 0 ? (usedStorageBytes / totalStorageBytes) * 100 : 0;

  const ramUsedGb = (memory.used_bytes / (1024 ** 3)).toFixed(1);
  const ramTotalGb = (memory.total_bytes / (1024 ** 3)).toFixed(1);

  const storageUsedGb = (usedStorageBytes / (1024 ** 3)).toFixed(1);
  const storageTotalGb = (totalStorageBytes / (1024 ** 3)).toFixed(1);

  const downloadMbps = (network.total_download_speed * 8 / (1000 * 1000)).toFixed(1);
  const uploadMbps = (network.total_upload_speed * 8 / (1000 * 1000)).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Host status & Quick summary */}
      <div className="card bg-gradient-to-r from-surface-100/90 via-surface-100/60 to-surface-200/40 border-surface-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-glow-emerald animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">{system.hostname}</h1>
              <span className="badge-emerald font-mono">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {system.os_name} • Kernel {system.kernel} • IP {system.server_ip}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Uptime</span>
            <span className="font-semibold text-slate-200">{system.uptime_human}</span>
          </div>
          <div className="text-right pl-4 border-l border-surface-300/40">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Health</span>
            <span className={`font-semibold ${
              health.overall_score >= 90 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {health.overall_score} / 100
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* CPU */}
        <MetricCard
          title="CPU Usage"
          value={cpu.usage_pct}
          unit="%"
          subtitle={`Load: ${cpu.load_avg.join(' ')}`}
          icon={Cpu}
          progressValue={cpu.usage_pct}
        />

        {/* RAM */}
        <MetricCard
          title="Memory"
          value={memory.usage_pct}
          unit="%"
          subtitle={`${ramUsedGb} GB / ${ramTotalGb} GB`}
          icon={Activity}
          progressValue={memory.usage_pct}
        />

        {/* Storage */}
        <MetricCard
          title="Storage"
          value={storagePct.toFixed(1)}
          unit="%"
          subtitle={`${storageUsedGb} GB / ${storageTotalGb} GB`}
          icon={HardDrive}
          progressValue={storagePct}
        />

        {/* Temperature */}
        <MetricCard
          title="CPU Package"
          value={cpu.temperature_c !== null && cpu.temperature_c !== undefined ? cpu.temperature_c : 'N/A'}
          unit={cpu.temperature_c !== null ? '°C' : ''}
          subtitle={temperature.is_available ? 'Thermal Zone HW' : 'Sensors unavail.'}
          icon={Flame}
          badge={{
            text: cpu.temperature_c && cpu.temperature_c > 75 ? 'WARM' : 'NORMAL',
            variant: cpu.temperature_c && cpu.temperature_c > 75 ? 'amber' : 'emerald',
          }}
        />

        {/* Power */}
        <MetricCard
          title="Power"
          value={power.is_available && power.current_watts ? power.current_watts : 'N/A'}
          unit={power.current_watts ? 'W' : ''}
          subtitle={power.is_available ? `${power.energy_today_kwh || 0} kWh today` : 'Not supported'}
          icon={Zap}
          badge={{
            text: power.power_source || 'AC',
            variant: 'cyan',
          }}
        />

        {/* Network */}
        <MetricCard
          title="Network Traffic"
          value={downloadMbps}
          unit="Mbps"
          subtitle={`↑ ${uploadMbps} Mbps`}
          icon={Network}
          badge={{
            text: system.primary_interface,
            variant: 'slate',
          }}
        />
      </div>

      {/* Row 2: Services, SSH Remote Access, Docker, and Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Services Status Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-white">System Services</h3>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs text-brand-500 hover:text-brand-400 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {top_services.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No active services detected.</p>
            ) : (
              top_services.slice(0, 5).map((srv) => (
                <div
                  key={srv.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50/50 border border-surface-300/30 text-xs"
                >
                  <span className="font-mono text-slate-200 truncate max-w-[140px]">{srv.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                      srv.status === 'running'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-surface-300/30 text-slate-400 border border-surface-300/40'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${srv.status === 'running' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    {srv.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SSH Remote Access Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-white">SSH Remote Access</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                ssh?.is_active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-surface-300/30 text-slate-400 border border-surface-300/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ssh?.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {ssh?.is_active ? `PORT ${ssh.port || 22} OPEN` : 'PORT CLOSED'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-surface-50/50 border border-surface-300/30">
                <span className="text-[10px] text-slate-400 block uppercase">Sessions</span>
                <span className="text-base font-bold font-mono text-emerald-400">{ssh?.total_sessions || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-50/50 border border-surface-300/30">
                <span className="text-[10px] text-slate-400 block uppercase">Connections</span>
                <span className="text-base font-bold font-mono text-cyan-400">{ssh?.total_connections || 0}</span>
              </div>
            </div>

            <div className="space-y-2">
              {!ssh?.sessions || ssh.sessions.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-surface-50/40 border border-surface-300/20 text-center py-4 space-y-1">
                  <p className="text-xs text-slate-400 font-mono">No active SSH client connected</p>
                  <span className="text-[10px] text-slate-500 font-mono">Listening on port {ssh?.port || 22}</span>
                </div>
              ) : (
                ssh.sessions.slice(0, 3).map((s, idx) => (
                  <div
                    key={s.pid || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-50/50 border border-surface-300/30 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-mono text-slate-200 font-semibold">{s.user}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1.5 truncate">
                          {s.client_ip}
                        </span>
                      </div>
                    </div>
                    <span className="badge-cyan text-[10px] font-mono flex-shrink-0">
                      {s.terminal || s.session_type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Docker Engine Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-white">Docker Management</h3>
            </div>
            <button
              onClick={() => onNavigate('docker')}
              className="text-xs text-brand-500 hover:text-brand-400 font-medium"
            >
              Details
            </button>
          </div>

          {!docker.is_available ? (
            <div className="p-4 rounded-xl bg-surface-50/60 border border-surface-300/30 text-center py-6 space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {docker.unavailability_reason || 'Docker is not installed or unavailable.'}
              </p>
              <span className="badge-slate text-[10px]">DAEMON OFF</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-surface-50/50 border border-surface-300/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                  <span className="text-base font-bold font-mono text-white">{docker.containers_count}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-50/50 border border-surface-300/30">
                  <span className="text-[10px] text-emerald-400 block uppercase">Running</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{docker.running_count}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-50/50 border border-surface-300/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Stopped</span>
                  <span className="text-base font-bold font-mono text-slate-400">{docker.stopped_count}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {docker.containers.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded bg-surface-50/30">
                    <span className="font-mono text-slate-300 truncate max-w-[150px]">{c.name}</span>
                    <span className="badge-emerald text-[10px]">{c.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System Health Breakdown Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-white">System Health</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {health.overall_score} / 100
            </span>
          </div>

          <div className="space-y-2">
            {health.components.map((comp) => (
              <div
                key={comp.name}
                className="flex items-center justify-between text-xs py-1.5 border-b border-surface-300/20 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">{comp.name}</span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">{comp.details}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Storage Partition Breakdown */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-white">Mounted Storage Disks</h3>
          </div>
          <button
            onClick={() => onNavigate('storage')}
            className="text-xs text-brand-500 hover:text-brand-400 font-medium"
          >
            Storage Explorer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storage.disks.map((disk) => {
            const usedGb = (disk.used_bytes / (1024 ** 3)).toFixed(1);
            const totalGb = (disk.total_bytes / (1024 ** 3)).toFixed(1);
            const freeGb = (disk.free_bytes / (1024 ** 3)).toFixed(1);

            return (
              <div
                key={disk.mountpoint}
                className="p-4 rounded-xl bg-surface-50/60 border border-surface-300/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{disk.mountpoint}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{disk.device} ({disk.fstype})</p>
                  </div>
                  <span className={`badge-${disk.warning_level === 'critical' ? 'rose' : disk.warning_level === 'warning' ? 'amber' : 'emerald'}`}>
                    {disk.usage_pct}%
                  </span>
                </div>

                <ProgressBar value={disk.usage_pct} size="sm" />

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
                  <span>{usedGb} GB used</span>
                  <span>{freeGb} GB free of {totalGb} GB</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
