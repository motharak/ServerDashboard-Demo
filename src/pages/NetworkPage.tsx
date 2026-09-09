import React from 'react';
import { Network, ArrowDown, ArrowUp, Wifi, Activity, CheckCircle2 } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export const NetworkPage: React.FC = () => {
  const { snapshot } = useMetrics();
  if (!snapshot) return null;
  const { network } = snapshot;

  const totalDownMbps = (network.total_download_speed * 8 / (1000 * 1000)).toFixed(2);
  const totalUpMbps = (network.total_upload_speed * 8 / (1000 * 1000)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner Throughput */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Download Throughput</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-cyan-400">{totalDownMbps}</span>
              <span className="text-xs font-mono text-slate-400">Mbps</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ArrowDown className="w-6 h-6" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Upload Throughput</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-indigo-400">{totalUpMbps}</span>
              <span className="text-xs font-mono text-slate-400">Mbps</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ArrowUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interfaces Table / Cards */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-white">Network Interfaces ({network.interfaces.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-400 border-b border-surface-300/30 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Interface</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">MAC Address</th>
                <th className="py-2.5 px-3 text-right">Download</th>
                <th className="py-2.5 px-3 text-right">Upload</th>
                <th className="py-2.5 px-3 text-right">Packets/s</th>
                <th className="py-2.5 px-3 text-right">Total Transferred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/20">
              {network.interfaces.map((iface) => {
                const rxKb = (iface.rx_bytes_sec / 1024).toFixed(1);
                const txKb = (iface.tx_bytes_sec / 1024).toFixed(1);
                const rxTotalMb = (iface.rx_total_bytes / (1024 * 1024)).toFixed(1);
                const txTotalMb = (iface.tx_total_bytes / (1024 * 1024)).toFixed(1);

                return (
                  <tr key={iface.name} className="hover:bg-surface-200/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{iface.name}</td>
                    <td className="py-3 px-3">
                      <span className={`badge-${iface.status === 'UP' ? 'emerald' : 'slate'} text-[10px]`}>
                        {iface.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{iface.ip_address || '—'}</td>
                    <td className="py-3 px-3 text-slate-400">{iface.mac_address || '—'}</td>
                    <td className="py-3 px-3 text-right text-cyan-400 font-semibold">{rxKb} KB/s</td>
                    <td className="py-3 px-3 text-right text-indigo-400 font-semibold">{txKb} KB/s</td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {(iface.rx_packets_sec + iface.tx_packets_sec).toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      ↓{rxTotalMb} MB / ↑{txTotalMb} MB
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
