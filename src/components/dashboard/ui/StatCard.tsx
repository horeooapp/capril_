import React from 'react';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  trend?: "up" | "down";
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, trend }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="text-xs text-slate-500 font-medium mb-1.5">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">{value}</div>
      {sub && (
        <div className={`text-xs mt-2 font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-400"}`}>
          {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{sub}
        </div>
      )}
    </div>
  );
};
