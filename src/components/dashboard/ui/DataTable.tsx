import React from 'react';

interface DataTableProps {
  cols: string[];
  rows: React.ReactNode[][];
}

export const DataTable: React.FC<DataTableProps> = ({ cols, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12.5px]">
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} className="text-left py-2 px-3 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 tracking-wide uppercase">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="py-[9px] px-3 text-slate-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
