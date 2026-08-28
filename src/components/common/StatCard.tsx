import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'teal' | 'slate';
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'emerald',
  badge,
  onClick,
}) => {
  const getBorderColor = () => {
    switch (color) {
      case 'emerald':
        return 'border-b-4 border-b-emerald-500';
      case 'blue':
        return 'border-b-4 border-b-blue-500';
      case 'amber':
        return 'border-b-4 border-b-amber-500';
      case 'rose':
        return 'border-b-4 border-b-rose-500';
      case 'teal':
        return 'border-b-4 border-b-teal-500';
      case 'slate':
      default:
        return 'border-b-4 border-b-slate-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 ${getBorderColor()} transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider truncate">
            {title}
          </div>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-tight">
              {badge}
            </span>
          )}
        </div>

        <div className="text-3xl font-bold text-slate-800 tracking-tight mt-1">
          {value}
        </div>
      </div>

      {(subtitle || icon) && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 text-xs">
          {subtitle && (
            <span className="text-slate-500 text-[11px] font-medium truncate">
              {subtitle}
            </span>
          )}
          {icon && (
            <div className="text-slate-400 ml-auto shrink-0">
              {icon}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
