import React from 'react';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, action }) => (
  <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden mb-4">
    {title && (
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="font-semibold text-[13px] text-slate-700">{title}</div>
        {action && <div className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer transition-colors">{action}</div>}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);
