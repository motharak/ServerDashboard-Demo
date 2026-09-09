import React, { useState, useEffect } from 'react';
import { Radio, Search, Filter, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { PortInfo } from '../types';

export const PortsPage: React.FC = () => {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState<string>('all');

  const fetchPorts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPorts();
      setPorts(data);
    } catch (err) {
      console.error('Failed to load listening ports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const filteredPorts = ports.filter((p) => {
    const matchesSearch =
      p.port.toString().includes(searchTerm) ||
      (p.process && p.process.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.service && p.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.address.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filterScope === 'all') return true;
    if (filterScope === 'tcp') return p.protocol === 'TCP';
    if (filterScope === 'udp') return p.protocol === 'UDP';
    if (filterScope === 'public') return p.scope === 'Public' || p.scope.includes('Public');
    if (filterScope === 'lan') return p.scope === 'LAN';
    if (filterScope === 'localhost') return p.scope === 'Localhost';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Security Note Header */}
      <div className="card-subtle flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Port Security & Exposure Policy: </span>
          Listening sockets mapped from real system telemetry. Publicly exposed ports (<code className="text-rose-400">0.0.0.0</code>) are highlighted. The dashboard will never automatically alter your firewall or open ports without explicit verification.
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search port, process, or service (e.g. 22, sshd)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono">
          {[
            { id: 'all', label: 'ALL' },
            { id: 'tcp', label: 'TCP' },
            { id: 'udp', label: 'UDP' },
            { id: 'public', label: 'PUBLIC' },
            { id: 'lan', label: 'LAN' },
            { id: 'localhost', label: 'LOCAL' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterScope(tab.id)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                filterScope === tab.id
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchPorts}
            className="p-1.5 text-slate-400 hover:text-white ml-1"
            title="Refresh ports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ports Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-200/40 text-slate-400 border-b border-surface-300/30 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Port</th>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Bind Address</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Process</th>
                <th className="py-3 px-4">PID</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/20">
              {filteredPorts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {isLoading ? 'Scanning open listening sockets...' : 'No matching listening ports found.'}
                  </td>
                </tr>
              ) : (
                filteredPorts.map((p, idx) => (
                  <tr key={`${p.port}-${p.protocol}-${p.address}-${idx}`} className="hover:bg-surface-200/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white text-sm">{p.port}</td>
                    <td className="py-3 px-4">
                      <span className={`badge-${p.protocol === 'TCP' ? 'cyan' : 'slate'} text-[10px]`}>
                        {p.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.address}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge-${
                          p.scope.includes('Public')
                            ? 'rose'
                            : p.scope === 'LAN'
                            ? 'amber'
                            : 'slate'
                        } text-[10px]`}
                      >
                        {p.scope}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{p.service || '—'}</td>
                    <td className="py-3 px-4 text-slate-300">{p.process || 'system'}</td>
                    <td className="py-3 px-4 text-slate-400">{p.pid || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="badge-emerald text-[10px]">{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
