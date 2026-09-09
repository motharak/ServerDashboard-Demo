import React from 'react';
import { Thermometer, Flame, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export const TemperaturePage: React.FC = () => {
  const { snapshot } = useMetrics();
  if (!snapshot) return null;
  const { temperature } = snapshot;

  if (!temperature.is_available || temperature.sensors.length === 0) {
    return (
      <div className="card text-center py-16 space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-surface-200/50 flex items-center justify-center mx-auto text-slate-400">
          <Thermometer className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Hardware Sensors Unavailable</h3>
          <p className="text-xs text-slate-400 font-mono">
            {temperature.unavailability_reason || 'Hardware temperature sensors are unavailable.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Threshold Guide */}
      <div className="card-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Thermometer className="w-4 h-4 text-brand-500" />
          <span>Configured Thresholds:</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Normal: &lt; 70°C
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Warning: 70–85°C
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Critical: &gt; 85°C
          </span>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {temperature.sensors.map((sensor) => {
          const badgeClass =
            sensor.status === 'critical'
              ? 'badge-rose'
              : sensor.status === 'warning'
              ? 'badge-amber'
              : 'badge-emerald';

          return (
            <div key={sensor.sensor_id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono truncate max-w-[180px]">
                    {sensor.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sensor.sensor_id}</p>
                </div>
                <span className={`${badgeClass} font-mono text-[10px]`}>
                  {sensor.status.toUpperCase()}
                </span>
              </div>

              {/* Current Temperature Display */}
              <div className="flex items-baseline gap-1.5 py-1">
                <span className={`text-3xl font-bold font-mono ${
                  sensor.status === 'critical'
                    ? 'text-rose-400'
                    : sensor.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-white'
                }`}>
                  {sensor.current_c}
                </span>
                <span className="text-xs text-slate-400 font-mono">°C</span>
              </div>

              {/* Min, Avg, Max stats */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-surface-300/30 text-center font-mono text-[11px]">
                <div className="p-1.5 rounded bg-surface-50/50">
                  <span className="text-[9px] text-slate-400 block uppercase">Min</span>
                  <span className="text-slate-200">{sensor.min_c ?? sensor.current_c}°C</span>
                </div>
                <div className="p-1.5 rounded bg-surface-50/50">
                  <span className="text-[9px] text-slate-400 block uppercase">Avg</span>
                  <span className="text-slate-200">{sensor.avg_c ?? sensor.current_c}°C</span>
                </div>
                <div className="p-1.5 rounded bg-surface-50/50">
                  <span className="text-[9px] text-slate-400 block uppercase">Max</span>
                  <span className="text-slate-200">{sensor.max_c ?? sensor.current_c}°C</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
