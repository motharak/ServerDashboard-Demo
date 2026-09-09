import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import { FirewallInfo } from '../types';

export const FirewallPage: React.FC = () => {
  const [firewall, setFirewall] = useState<FirewallInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFirewall = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFirewall();
      setFirewall(data);
    } catch (err) {
      console.error('Failed to load firewall info', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFirewall();
  }, []);

  const filteredRules = (firewall?.rules || []).filter((r) => {
    const q = search.toLowerCase();
    return (
      r.to_port.toLowerCase().includes(q) ||
      r.from_ip.toLowerCase().includes(q) ||
      r.action.toLowerCase().includes(q) ||
      (r.comment && r.comment.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('ALLOW')) {
      return <span className="badge-emerald text-[10px] py-0.5 px-2">{act}</span>;
    }
    if (act.includes('LIMIT')) {
      return <span className="badge-amber text-[10px] py-0.5 px-2">{act}</span>;
    }
    return <span className="badge-rose text-[10px] py-0.5 px-2">{act}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Firewall Overview Card */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase font-mono">
                {firewall?.system || 'Firewall System'}
              </h3>
              <span className={`badge-${firewall?.status === 'active' ? 'emerald' : 'amber'} text-[11px] font-mono px-2 py-0.5`}>
                {firewall?.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {firewall?.message || 'Linux packet filtering and port access controller'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Default Inbound</span>
            <span className="font-semibold text-rose-400">{firewall?.default_incoming || 'DENY'}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Default Outbound</span>
            <span className="font-semibold text-emerald-400">{firewall?.default_outgoing || 'ALLOW'}</span>
          </div>
          <button
            onClick={fetchFirewall}
            className="p-2.5 rounded-lg text-slate-400 hover:text-white bg-surface-50 hover:bg-surface-200 border border-surface-300/30 transition-colors"
            title="Refresh firewall"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-white">Active Firewall Rules ({firewall?.rules.length || 0})</h4>
            <p className="text-xs text-slate-400 font-mono">Kernel-enforced port filtering and source IP allowances</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search port, IP, or rule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-50 border border-surface-300/40 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {firewall?.rules.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface-50/50 border border-surface-300/30 text-center space-y-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-white font-mono">No Active Firewall Rules Found</h5>
              <p className="text-xs text-slate-400 font-mono max-w-lg mx-auto">
                {firewall?.message || 'No rules configured or elevated permissions required.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/40 text-slate-400 border-b border-surface-300/30 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">To Port / Service</th>
                  <th className="py-2.5 px-3">Policy Action</th>
                  <th className="py-2.5 px-3">From IP / Subnet</th>
                  <th className="py-2.5 px-3">Description / Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {filteredRules.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-200/30 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-bold">{r.id || i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <span className="px-2 py-0.5 rounded bg-surface-200/60 border border-surface-300/40">
                        {r.to_port}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {getActionBadge(r.action)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{r.from_ip}</td>
                    <td className="py-2.5 px-3 text-slate-400">{r.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRules.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No rules match query "{search}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
