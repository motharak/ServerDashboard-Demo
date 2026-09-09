import React, { useState, useEffect } from 'react';
import { Layers, Play, Square, RotateCcw, Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { ServiceItem, ConfirmationTokenResponse } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped' | 'failed'>('all');

  // Confirmation Modal state
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    token: string;
    action: string;
    serviceName: string;
    prompt: string;
  } | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleTriggerAction = async (serviceName: string, action: string) => {
    try {
      const res = await api.requestServiceAction(serviceName, action);
      setPendingConfirmation({
        token: res.token,
        action,
        serviceName,
        prompt: res.prompt,
      });
    } catch (err: any) {
      alert(err.message || 'Action request failed');
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation) return;
    await api.confirmServiceAction(
      pendingConfirmation.serviceName,
      pendingConfirmation.action,
      pendingConfirmation.token
    );
    await fetchServices();
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar: Search, Filter, Refresh */}
      <div className="card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search systemd services..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono">
          {[
            { id: 'all', label: 'ALL' },
            { id: 'running', label: 'RUNNING' },
            { id: 'stopped', label: 'STOPPED' },
            { id: 'failed', label: 'FAILED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchServices}
            className="p-1.5 text-slate-400 hover:text-white ml-1"
            title="Refresh services"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-200/40 text-slate-400 border-b border-surface-300/30 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">PID</th>
                {user?.role === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/20">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {isLoading ? 'Loading systemd units...' : 'No matching services found.'}
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.name} className="hover:bg-surface-200/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{srv.name}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{srv.description}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge-${
                          srv.status === 'running'
                            ? 'emerald'
                            : srv.status === 'failed'
                            ? 'rose'
                            : 'slate'
                        } text-[10px]`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${srv.status === 'running' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        {srv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{srv.pid || '—'}</td>
                    {user?.role === 'admin' && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {srv.status !== 'running' && (
                            <button
                              onClick={() => handleTriggerAction(srv.name, 'start')}
                              className="p-1.5 rounded bg-surface-200/50 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors"
                              title="Start service"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {srv.status === 'running' && (
                            <button
                              onClick={() => handleTriggerAction(srv.name, 'restart')}
                              className="p-1.5 rounded bg-surface-200/50 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                              title="Restart service"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {srv.status === 'running' && (
                            <button
                              onClick={() => handleTriggerAction(srv.name, 'stop')}
                              className="p-1.5 rounded bg-surface-200/50 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                              title="Stop service"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingConfirmation && (
        <ConfirmationModal
          isOpen={true}
          title={`Confirm Service Action: ${pendingConfirmation.action.toUpperCase()}`}
          prompt={pendingConfirmation.prompt}
          confirmLabel={`Execute ${pendingConfirmation.action.toUpperCase()}`}
          isDangerous={pendingConfirmation.action === 'stop'}
          onConfirm={handleConfirmAction}
          onClose={() => setPendingConfirmation(null)}
        />
      )}
    </div>
  );
};
