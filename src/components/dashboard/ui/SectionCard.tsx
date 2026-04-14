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
  <div className={`bg-white rounded-[10px] border border-slate-200 overflow-hidden mb-4 shadow-sm ${className || ''}`}>
    {title && (
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="font-semibold text-[13px] text-slate-700 flex items-center gap-2">
            {icon && icon}
            {title}
        </div>
        {action && <div className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer transition-colors">{action}</div>}
      </div>
    )}
    <div className={noPadding ? "" : "p-4"}>{children}</div>
  </div>
);
