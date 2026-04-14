import React from 'react';

export type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'sky' | 'violet' | 'gray' | 'rose' | 'purple' | 'emerald';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray' }) => {
  const map = {
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-rose-100 text-rose-800",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-sky-100 text-sky-800",
    sky: "bg-sky-100 text-sky-800",
    violet: "bg-violet-100 text-violet-800",
    gray: "bg-slate-100 text-slate-700",
    rose: "bg-rose-100 text-rose-800",
    purple: "bg-purple-100 text-purple-800",
    emerald: "bg-emerald-100 text-emerald-800",
  };
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[10.5px] font-bold uppercase tracking-widest ${map[color]}`}>
      {children}
    </span>
  );
};
