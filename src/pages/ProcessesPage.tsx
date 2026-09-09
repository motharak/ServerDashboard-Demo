import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { ProcessItem } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

export const ProcessesPage: React.FC = () => {
  const { user } = useAuth();
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'pid' | 'name'>('cpu');

  const [pendingKill, setPendingKill] = useState<{
    pid: number;
    token: string;
    prompt: string;
  } | null>(null);

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProcesses(sortBy);
      setProcesses(data);
    } catch (err) {
      console.error('Failed to load processes', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, [sortBy]);

  const handleRequestKill = async (pid: number) => {
    try {
      const res = await api.requestKillProcess(pid);
      setPendingKill({
        pid,
        token: res.token,
        prompt: res.prompt,
      });
    } catch (err: any) {
      alert(err.message || 'Kill request failed');
    }
  };

  const handleConfirmKill = async () => {
    if (!pendingKill) return;
    await api.confirmKillProcess(pendingKill.pid, pendingKill.token);
    await fetchProcesses();
  };

  const filtered = processes.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.pid.toString().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.user.toLowerCase().includes(term) ||
      p.command.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search processes by PID, name, command, or user..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono">
          <span className="text-slate-400 px-2">SORT BY:</span>
          {(['cpu', 'memory', 'pid', 'name'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded transition-colors uppercase ${
                sortBy === s ? 'bg-brand-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={fetchProcesses}
            className="p-1.5 text-slate-400 hover:text-white ml-1"
            title="Refresh process table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Process Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-200/40 text-slate-400 border-b border-surface-300/30 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Process Name</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3 text-right">CPU %</th>
                <th className="py-2.5 px-3 text-right">Memory %</th>
                <th className="py-2.5 px-3 text-right">RSS</th>
                <th className="py-2.5 px-3">Runtime</th>
                <th className="py-2.5 px-3">Command</th>
                {user?.role === 'admin' && <th className="py-2.5 px-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/20">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    {isLoading ? 'Reading procfs...' : 'No matching processes found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const memMb = (p.memory_bytes / (1024 * 1024)).toFixed(1);
                  return (
                    <tr key={p.pid} className="hover:bg-surface-200/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{p.pid}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{p.user}</td>
                      <td className="py-2.5 px-3 text-right text-brand-400 font-semibold">{p.cpu_pct}%</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">{p.memory_pct}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{memMb} MB</td>
                      <td className="py-2.5 px-3 text-slate-400">{p.runtime}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={p.command}>
                        {p.command}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRequestKill(p.pid)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={`Terminate PID ${p.pid}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kill Confirmation Modal */}
      {pendingKill && (
        <ConfirmationModal
          isOpen={true}
          title={`Confirm Process Termination: PID ${pendingKill.pid}`}
          prompt={pendingKill.prompt}
          confirmLabel="Terminate Process"
          isDangerous={true}
          onConfirm={handleConfirmKill}
          onClose={() => setPendingKill(null)}
        />
      )}
    </div>
  );
};
