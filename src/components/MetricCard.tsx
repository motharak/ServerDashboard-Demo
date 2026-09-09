import React from 'react';
import { ProgressBar } from './ProgressBar';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: React.ElementType;
  progressValue?: number;
  badge?: {
    text: string;
    variant: 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  progressValue,
  badge,
  className = '',
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    slate: 'bg-surface-300/30 text-slate-300 border-surface-300/40',
  };

  return (
    <div className={`card flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="p-2 rounded-lg bg-surface-200/50 text-slate-300 border border-surface-300/30">
            <Icon className="w-4 h-4 text-brand-500" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
          {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>
        )}
      </div>

      {progressValue !== undefined && (
        <div className="mt-4 pt-3 border-t border-surface-300/20">
          <ProgressBar value={progressValue} size="sm" />
        </div>
      )}

      {badge && (
        <div className="mt-4 pt-3 border-t border-surface-300/20 flex justify-end">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${badgeClasses[badge.variant]}`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
