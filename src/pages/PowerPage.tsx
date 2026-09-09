import React, { useState, useEffect } from 'react';
import { Zap, DollarSign, Calendar, Save, CheckCircle2, Loader2, AlertCircle, Cpu, Gauge, BarChart3, HardDrive } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';
import { api } from '../services/api';
import { Preferences, DailyPowerPoint } from '../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

export const PowerPage: React.FC = () => {
  const { snapshot, refresh } = useMetrics();
  const [priceInput, setPriceInput] = useState('0.15');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allPreferences, setAllPreferences] = useState<Preferences | null>(null);

  // Load persisted preferences from backend on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const p = await api.getPreferences();
        setAllPreferences(p);
        setPriceInput(p.electricity_price_per_kwh.toString());
        setCurrencySymbol(p.currency);
      } catch (err) {
        console.error('Failed to load operational preferences on Power page', err);
      }
    }
    loadPreferences();
  }, []);

  // Synchronize with live server snapshot if not actively being edited by user
  useEffect(() => {
    if (!isDirty && snapshot?.power) {
      if (snapshot.power.price_per_kwh !== undefined && snapshot.power.price_per_kwh !== null) {
        setPriceInput(snapshot.power.price_per_kwh.toString());
      }
      if (snapshot.power.currency) {
        setCurrencySymbol(snapshot.power.currency);
      }
    }
  }, [snapshot?.power, isDirty]);

  if (!snapshot) return null;
  const { power } = snapshot;

  if (!power.is_available) {
    return (
      <div className="card text-center py-16 space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-surface-200/50 flex items-center justify-center mx-auto text-slate-400">
          <Zap className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Power Monitoring</h3>
          <p className="text-xs text-slate-400 font-mono">
            {power.unavailability_reason || 'Power monitoring is unavailable on this hardware.'}
          </p>
        </div>
      </div>
    );
  }

  // Active calculations based on live snapshot & configured rate
  const activeRate = parseFloat(priceInput) || 0.15;
  const activeCurrency = currencySymbol.trim() || '$';

  const realTodayCost = power.cost_today !== undefined && power.cost_today !== null
    ? power.cost_today.toFixed(2)
    : ((power.energy_today_kwh || 0) * activeRate).toFixed(2);

  const realMonthCost = power.cost_month !== undefined && power.cost_month !== null
    ? power.cost_month.toFixed(2)
    : ((power.energy_month_kwh || 0) * activeRate).toFixed(2);

  const projectedMonthCost = power.projected_month_kwh
    ? (power.projected_month_kwh * activeRate).toFixed(2)
    : (power.estimated_cost_month ? power.estimated_cost_month.toFixed(2) : '0.00');

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      let currentPrefs = allPreferences;
      if (!currentPrefs) {
        currentPrefs = await api.getPreferences();
      }

      const updatedPrefs: Preferences = {
        electricity_price_per_kwh: activeRate,
        currency: activeCurrency,
        temp_warning_max: currentPrefs.temp_warning_max ?? 75.0,
        temp_critical_max: currentPrefs.temp_critical_max ?? 85.0,
        storage_warning_pct: currentPrefs.storage_warning_pct ?? 85.0,
        cpu_warning_pct: currentPrefs.cpu_warning_pct ?? 85.0,
        ram_warning_pct: currentPrefs.ram_warning_pct ?? 90.0,
      };

      await api.updatePreferences(updatedPrefs);
      setAllPreferences(updatedPrefs);
      setIsDirty(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);

      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update electricity rate settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatKwh = (val?: number | null) => {
    if (val === null || val === undefined) return '0.000';
    if (val === 0) return '0.000';
    if (val < 0.1) return val.toFixed(4);
    if (val < 10) return val.toFixed(3);
    return val.toFixed(2);
  };

  const historyData = (power.history_days && power.history_days.length > 0)
    ? power.history_days
    : [
        {
          date: 'Today',
          kwh: power.energy_today_kwh || 0.0,
          cost: parseFloat(realTodayCost),
          avg_watts: power.current_watts || 0.0,
          peak_watts: power.current_watts || 0.0,
        }
      ];

  return (
    <div className="space-y-6">
      {/* 4 Key Power Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Draw */}
        <div className="card space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
            <span>Current Consumption</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-cyan-400">
              {power.current_watts !== null && power.current_watts !== undefined ? power.current_watts : '—'}
            </span>
            <span className="text-xs font-mono text-slate-400">Watts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-surface-300/20">
            <span>CPU: {power.cpu_package_watts ? `${power.cpu_package_watts}W` : '—'}</span>
            <span>GPU: {power.gpu_watts ? `${power.gpu_watts}W` : '—'}</span>
            <span>RAM: {power.dram_watts ? `${power.dram_watts}W` : '—'}</span>
          </div>
        </div>

        {/* Energy Today (Real Metered) */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
            <span>Energy Today</span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                REAL METERED
              </span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {formatKwh(power.energy_today_kwh)}
            </span>
            <span className="text-xs font-mono text-slate-400">kWh</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-surface-300/20">
            <span>Accrued: {activeCurrency}{realTodayCost}</span>
            <span>Yesterday: {power.energy_yesterday_kwh ?? '0.00'} kWh</span>
          </div>
        </div>

        {/* Month to Date & Projected */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
            <span>Month-to-Date & Proj.</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-indigo-400">
              {power.energy_month_kwh !== null && power.energy_month_kwh !== undefined ? power.energy_month_kwh : '0.00'}
            </span>
            <span className="text-xs font-mono text-slate-400">kWh MTD</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-surface-300/20">
            <span>Projected: {power.projected_month_kwh ?? '0.0'} kWh/mo</span>
            <span>7d: {power.energy_week_kwh ?? '0.0'} kWh</span>
          </div>
        </div>

        {/* Real Electricity Cost */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
            <span>Month Cost (MTD)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-amber-400">
              {activeCurrency}{realMonthCost}
            </span>
            <span className="text-xs font-mono text-slate-400">MTD</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-surface-300/20">
            <span>Proj: {activeCurrency}{projectedMonthCost}/mo</span>
            <span>Rate: {activeCurrency}{activeRate}/kWh</span>
          </div>
        </div>
      </div>

      {/* Daily Consumption History & Hardware Telemetry Rails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Energy History Chart (2 Columns) */}
        <div className="card space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-surface-300/30 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Daily Real Energy History</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Recorded Daily kWh & Cost ({activeCurrency})
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => {
                    if (val.length >= 10) return val.slice(5); // Show MM-DD
                    return val;
                  }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  unit=" kWh"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d: DailyPowerPoint = payload[0].payload;
                      return (
                        <div className="bg-surface-100 border border-surface-300 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1">
                          <div className="font-bold text-white border-b border-surface-300/40 pb-1">{d.date}</div>
                          <div className="text-emerald-400 flex justify-between gap-4">
                            <span>Real Energy:</span>
                            <span className="font-bold">{d.kwh} kWh</span>
                          </div>
                          <div className="text-amber-400 flex justify-between gap-4">
                            <span>Cost:</span>
                            <span className="font-bold">{activeCurrency}{d.cost.toFixed(2)}</span>
                          </div>
                          {d.avg_watts > 0 && (
                            <div className="text-cyan-400 flex justify-between gap-4">
                              <span>Avg Power:</span>
                              <span>{d.avg_watts} W</span>
                            </div>
                          )}
                          {d.peak_watts > 0 && (
                            <div className="text-rose-400 flex justify-between gap-4">
                              <span>Peak Power:</span>
                              <span>{d.peak_watts} W</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="kwh" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {historyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === historyData.length - 1 ? '#10b981' : '#0284c7'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-surface-300/20">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> Historical Days
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Active Today (Metered)
              </span>
            </div>
            <span>Lifetime Meter: <strong className="text-white">{power.total_meter_kwh ?? '0.00'} kWh</strong></span>
          </div>
        </div>

        {/* Hardware Power Rail Breakdown */}
        <div className="card space-y-4">
          <div className="border-b border-surface-300/30 pb-3">
            <h3 className="text-sm font-semibold text-white">Power Supply & Rail Telemetry</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time hardware power consumption channels</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* CPU Package Draw */}
            <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-300 font-semibold block">CPU Package (i7-9750H)</span>
                <span className="text-[10px] text-slate-400 block">Intel RAPL Hardware Sensor</span>
              </div>
              <span className="text-cyan-400 font-bold text-sm">
                {power.cpu_package_watts !== null && power.cpu_package_watts !== undefined ? `${power.cpu_package_watts} W` : '—'}
              </span>
            </div>

            {/* GPU Power Draw */}
            <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-300 font-semibold block">GPU Draw (GTX 1650)</span>
                <span className="text-[10px] text-slate-400 block">NVIDIA SMI Sensor</span>
              </div>
              <span className="text-slate-100 font-bold text-sm">
                {power.gpu_watts !== null && power.gpu_watts !== undefined ? `${power.gpu_watts} W` : 'N/A'}
              </span>
            </div>

            {/* DRAM Rail */}
            {power.dram_watts !== null && power.dram_watts !== undefined && (
              <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-slate-300 font-semibold block">DRAM Memory Rail</span>
                  <span className="text-[10px] text-slate-400 block">Intel RAPL DRAM Subzone</span>
                </div>
                <span className="text-indigo-400 font-bold text-sm">
                  {power.dram_watts} W
                </span>
              </div>
            )}

            {/* Lifetime Meter (Odometer) */}
            <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-300 font-semibold block">Lifetime Energy Meter</span>
                <span className="text-[10px] text-slate-400 block">Cumulative Server Odometer</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm">
                {power.total_meter_kwh ?? '0.00'} kWh
              </span>
            </div>

            {/* UPS / Battery Level */}
            {power.battery_level_pct !== null && power.battery_level_pct !== undefined && (
              <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 flex items-center justify-between">
                <span className="text-slate-300">Internal UPS / Battery</span>
                <span className="text-emerald-400 font-bold">{power.battery_level_pct}%</span>
              </div>
            )}

            {/* AC Power Supply Status */}
            <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30 flex items-center justify-between">
              <span className="text-slate-300">AC Power Supply Status</span>
              <span className="badge-emerald text-[10px]">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Electricity Rate Configuration Card */}
      <div className="card space-y-4 max-w-2xl">
        <div className="border-b border-surface-300/30 pb-3">
          <h3 className="text-sm font-semibold text-white">Electricity Rate Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize electricity pricing parameters to calibrate real accrued and projected operational expenses across all views.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveRate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">Price per kWh</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">Currency Symbol</label>
              <input
                type="text"
                required
                maxLength={8}
                value={currencySymbol}
                onChange={(e) => {
                  setCurrencySymbol(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-300/20">
            {savedSuccess ? (
              <span className="badge-emerald flex items-center gap-1.5 text-xs py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Rate saved & applied to server
              </span>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-brand-600/20"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Rate Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
