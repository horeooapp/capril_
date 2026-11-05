import React from 'react';

export type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'sky' | 'violet' | 'gray' | 'rose' | 'purple' | 'emerald';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    red: "bg-rose-50 text-rose-700 border-rose-200/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60",
    blue: "bg-sky-50 text-sky-700 border-sky-200/60",
    sky: "bg-sky-50 text-sky-700 border-sky-200/60",
    violet: "bg-violet-50 text-violet-700 border-violet-200/60",
    gray: "bg-slate-50 text-slate-700 border-slate-200/60",
    rose: "bg-rose-50 text-rose-700 border-rose-200/60",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${map[color]} ${className}`}>
      {children}
    </span>
  );
};
