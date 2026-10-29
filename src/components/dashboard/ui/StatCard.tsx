import React from 'react';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  trend?: "up" | "down";
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, trend }) => {
  return (
    <div className="relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
      {/* Reflet subtil de coin */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-100/60 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      
      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 relative z-10">
        {label}
      </div>
      
      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none relative z-10 font-mono">
        {value}
      </div>
      
      {sub && (
        <div className={`text-xs mt-3 font-semibold flex items-center gap-1.5 relative z-10 ${
          trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"
        }`}>
          {trend === "up" && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
              ↑
            </span>
          )}
          {trend === "down" && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
              ↓
            </span>
          )}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
};
