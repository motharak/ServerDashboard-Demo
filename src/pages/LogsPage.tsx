import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, RefreshCw, Filter } from 'lucide-react';
import { api } from '../services/api';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Array<{ timestamp: string; host: string; process: string; level: string; message: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [linesCount, setLinesCount] = useState<number>(100);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLogs({
        lines: linesCount,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        search: searchTerm || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load system logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [priorityFilter, linesCount]);

  const handleDownload = () => {
    const text = logs.map((l) => `${l.timestamp} [${l.level}] ${l.process}: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
      case 'EMERGENCY':
        return 'badge-rose';
      case 'ERROR':
        return 'badge-rose';
      case 'WARNING':
        return 'badge-amber';
      default:
        return 'badge-slate';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            placeholder="Search journal log text (press Enter)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono">
            {['all', 'info', 'warning', 'err'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded transition-colors uppercase ${
                  priorityFilter === p ? 'bg-brand-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'err' ? 'ERROR' : p}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-surface-200/50 hover:bg-surface-200 text-slate-300 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-200/50 hover:bg-surface-200 text-xs font-mono text-slate-300 transition-colors"
            title="Download logs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Logs Terminal Window */}
      <div className="card bg-surface-950/90 border-surface-300/40 p-4 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-300/30 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            <span>Journalctl Stream ({logs.length} entries)</span>
          </div>
          <span>Ubuntu Systemd Journal</span>
        </div>

        <div className="max-h-[650px] overflow-y-auto space-y-1.5 pr-2">
          {logs.length === 0 ? (
            <p className="text-slate-500 py-8 text-center font-mono">
              {isLoading ? 'Streaming systemd journal...' : 'No matching log entries found.'}
            </p>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-1.5 rounded hover:bg-surface-200/20 text-slate-300 transition-colors leading-relaxed"
              >
                <span className="text-slate-400 text-[10px] shrink-0 font-mono select-none">
                  {log.timestamp.slice(11, 19)}
                </span>
                <span className={`${getLevelBadge(log.level)} text-[9px] shrink-0 font-mono uppercase`}>
                  {log.level}
                </span>
                <span className="text-brand-400 shrink-0 font-semibold">{log.process}:</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
