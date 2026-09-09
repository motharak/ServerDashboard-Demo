import React from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export const AlertsPage: React.FC = () => {
  const { snapshot } = useMetrics();
  if (!snapshot) return null;

  const { cpu, memory, storage, temperature } = snapshot;

  // Generate real alert items based on collected metrics
  const activeAlerts: Array<{
    id: string;
    level: 'critical' | 'warning' | 'info' | 'recovery';
    title: string;
    description: string;
    time: string;
  }> = [];

  // CPU Alert
  if (cpu.usage_pct >= 90) {
    activeAlerts.push({
      id: 'cpu-crit',
      level: 'critical',
      title: 'CPU Usage Critical',
      description: `Processor load exceeded critical threshold (${cpu.usage_pct}% >= 90%)`,
      time: 'Live',
    });
  } else if (cpu.usage_pct >= 80) {
    activeAlerts.push({
      id: 'cpu-warn',
      level: 'warning',
      title: 'CPU Usage Elevated',
      description: `Processor load elevated (${cpu.usage_pct}% >= 80%)`,
      time: 'Live',
    });
  }

  // Memory Alert
  if (memory.usage_pct >= 92) {
    activeAlerts.push({
      id: 'mem-crit',
      level: 'critical',
      title: 'Memory Capacity Critical',
      description: `RAM allocation reached critical saturation (${memory.usage_pct}%)`,
      time: 'Live',
    });
  }

  // Storage Alerts
  storage.disks.forEach((d) => {
    if (d.usage_pct >= 95) {
      activeAlerts.push({
        id: `disk-${d.mountpoint}`,
        level: 'critical',
        title: `Disk Partition Full: ${d.mountpoint}`,
        description: `Storage reached critical capacity (${d.usage_pct}% >= 95%)`,
        time: 'Live',
      });
    } else if (d.usage_pct >= 85) {
      activeAlerts.push({
        id: `disk-${d.mountpoint}`,
        level: 'warning',
        title: `Storage Warning: ${d.mountpoint}`,
        description: `Storage reached warning threshold (${d.usage_pct}% >= 85%)`,
        time: 'Live',
      });
    }
  });

  // Temperature Alerts
  if (temperature.is_available) {
    temperature.sensors.forEach((s) => {
      if (s.status === 'critical') {
        activeAlerts.push({
          id: `temp-${s.sensor_id}`,
          level: 'critical',
          title: `High Temperature: ${s.name}`,
          description: `Sensor exceeded thermal threshold (${s.current_c}°C > 85°C)`,
          time: 'Live',
        });
      } else if (s.status === 'warning') {
        activeAlerts.push({
          id: `temp-${s.sensor_id}`,
          level: 'warning',
          title: `Elevated Temperature: ${s.name}`,
          description: `Sensor in warning range (${s.current_c}°C >= 70°C)`,
          time: 'Live',
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Alert Count Summary */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Notification & Alert Center</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated triggers calculated continuously from active hardware telemetry
            </p>
          </div>
        </div>

        <span className={`badge-${activeAlerts.length > 0 ? 'amber' : 'emerald'} font-mono text-xs px-3 py-1`}>
          {activeAlerts.length > 0 ? `${activeAlerts.length} ACTIVE ALERTS` : 'ALL SYSTEMS NOMINAL'}
        </span>
      </div>

      {/* Alert Feed */}
      <div className="card space-y-3">
        <h4 className="text-sm font-semibold text-white">Active Notifications</h4>

        {activeAlerts.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">No Warnings or Critical Alerts</p>
            <p className="text-xs text-slate-400 font-mono">
              All monitored metrics (CPU, RAM, storage, temperatures, network) are within safe operating limits.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 font-mono text-xs ${
                  alert.level === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.level === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="font-bold text-slate-100">{alert.title}</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">{alert.description}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
