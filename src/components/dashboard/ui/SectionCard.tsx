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
  <div className={`bg-white rounded-xl border border-slate-200/90 overflow-hidden mb-6 shadow-sm transition-colors ${className || ''}`}>
    {title && (
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-2">
            {icon && icon}
            {title}
        </div>
        {action && <div className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">{action}</div>}
      </div>
    )}
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);
