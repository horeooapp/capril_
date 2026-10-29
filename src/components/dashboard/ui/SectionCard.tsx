import React from 'react';

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, action, noPadding, className }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/90 overflow-hidden mb-6 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 ${className || ''}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="font-black text-sm text-slate-900 tracking-tight uppercase flex items-center gap-2.5">
            {icon && icon}
            {title}
        </div>
        {action && <div className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">{action}</div>}
      </div>
    )}
    <div className={noPadding ? "" : "p-6"}>{children}</div>
  </div>
);
