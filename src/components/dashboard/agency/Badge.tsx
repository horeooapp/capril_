import React from 'react';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  size?: number;
}

export const Badge: React.FC<BadgeProps> = ({ label, color, bg, size = 10 }) => {
  return (
    <span
      className="inline-block px-2 py-1 rounded-md font-bold whitespace-nowrap"
      style={{
        backgroundColor: bg,
        color: color,
        fontSize: `${size}px`,
      }}
    >
      {label}
    </span>
  );
};
