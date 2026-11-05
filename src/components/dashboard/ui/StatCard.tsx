import React from 'react';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  trend?: "up" | "down";
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, trend }) => {
  return (
    <div className="relative bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm transition-colors overflow-hidden">
      <div className="text-xs font-medium text-slate-500 mb-1.5">
        {label}
      </div>
      
      <div className="text-2xl font-semibold text-slate-900 tracking-tight leading-none font-mono tabular-nums">
        {value}
      </div>
      
      {sub && (
        <div className={`text-xs mt-2.5 font-medium flex items-center gap-1.5 ${
          trend === "up" ? "text-emerald-700" : trend === "down" ? "text-rose-700" : "text-slate-500"
        }`}>
          {trend === "up" && (
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
              ↑
            </span>
          )}
          {trend === "down" && (
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold">
              ↓
            </span>
          )}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
};
