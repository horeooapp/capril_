import React from 'react';

export type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'sky' | 'violet' | 'gray' | 'rose' | 'purple' | 'emerald';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    red: "bg-rose-50 text-rose-700 border-rose-200/50",
    amber: "bg-amber-50 text-amber-700 border-amber-200/50",
    blue: "bg-sky-50 text-sky-700 border-sky-200/50",
    sky: "bg-sky-50 text-sky-700 border-sky-200/50",
    violet: "bg-violet-50 text-violet-700 border-violet-200/50",
    gray: "bg-slate-50 text-slate-700 border-slate-200/50",
    rose: "bg-rose-50 text-rose-700 border-rose-200/50",
    purple: "bg-purple-50 text-purple-700 border-purple-200/50",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${map[color]} ${className}`}>
      {children}
    </span>
  );
};
