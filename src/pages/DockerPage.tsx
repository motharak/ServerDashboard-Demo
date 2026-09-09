import React, { useState, useEffect } from 'react';
import { Boxes, Play, Square, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { DockerInfo } from '../types';

export const DockerPage: React.FC = () => {
  const [dockerInfo, setDockerInfo] = useState<DockerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocker = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDocker();
      setDockerInfo(data);
    } catch (err) {
      console.error('Failed to load Docker info', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocker();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!dockerInfo || !dockerInfo.is_available) {
    return (
      <div className="card text-center py-16 space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-surface-200/50 flex items-center justify-center mx-auto border border-surface-300/40 text-slate-400">
          <Boxes className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Docker Engine Status</h3>
          <p className="text-xs text-slate-400 font-mono">
            {dockerInfo?.unavailability_reason || 'Docker is not installed or unavailable.'}
          </p>
        </div>
        <div className="pt-2">
          <span className="badge-slate font-mono text-xs">STATUS: NOT AVAILABLE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <span className="text-xs text-slate-400 block uppercase">Total Containers</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{dockerInfo.containers_count}</span>
        </div>
        <div className="card">
          <span className="text-xs text-emerald-400 block uppercase">Running Containers</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{dockerInfo.running_count}</span>
        </div>
        <div className="card">
          <span className="text-xs text-slate-400 block uppercase">Stopped / Exited</span>
          <span className="text-2xl font-bold font-mono text-slate-400 mt-1 block">{dockerInfo.stopped_count}</span>
        </div>
      </div>

      {/* Containers List */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-white">Containers ({dockerInfo.containers.length})</h3>

        {dockerInfo.containers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center font-mono">No containers currently deployed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/40 text-slate-400 border-b border-surface-300/30 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Image</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Ports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {dockerInfo.containers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-200/30">
                    <td className="py-2.5 px-3 font-semibold text-white">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.image}</td>
                    <td className="py-2.5 px-3">
                      <span className={`badge-${c.state === 'running' ? 'emerald' : 'slate'} text-[10px]`}>
                        {c.state}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{c.status}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.ports.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
