import React from 'react';

export type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'violet' | 'gray';

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
    violet: "bg-violet-100 text-violet-800",
    gray: "bg-slate-100 text-slate-700",
  };
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${map[color]}`}>
      {children}
    </span>
  );
};
