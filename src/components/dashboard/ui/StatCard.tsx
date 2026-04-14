import React from 'react';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  trend?: "up" | "down";
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, trend }) => {
  return (
    <div className="bg-white rounded-[10px] p-[14px_16px] border border-slate-200">
      <div className="text-[11px] text-slate-500 font-medium mb-1">{label}</div>
      <div className="text-[22px] font-bold text-slate-800 leading-[1.1]">{value}</div>
      {sub && (
        <div className={`text-[11px] mt-1 ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-400"}`}>
          {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{sub}
        </div>
      )}
    </div>
  );
};
