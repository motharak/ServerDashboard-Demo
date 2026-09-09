import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  let colorClass = 'bg-cyan-500';
  if (clamped >= 95) {
    colorClass = 'bg-rose-500 animate-pulse';
  } else if (clamped >= 85) {
    colorClass = 'bg-rose-400';
  } else if (clamped >= 70) {
    colorClass = 'bg-amber-400';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono mb-1 text-slate-400">
          <span>Usage</span>
          <span className="font-semibold text-slate-200">{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-300/40 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
