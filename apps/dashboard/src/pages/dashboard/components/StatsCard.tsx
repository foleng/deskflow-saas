import React, { type ReactNode } from 'react';
import classNames from 'classnames';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  trendColor?: 'green' | 'red'; // 也就是上涨是好还是坏
  iconBgColor?: string; // 图标背景色
  iconColor?: string;   // 图标颜色
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection,
  trendColor = 'green',
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className="text-slate-500 font-medium text-sm">{title}</span>
        <div className={classNames("p-2 rounded-lg", iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        
        {trend && (
          <div className={classNames(
            "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
            {
              'bg-green-100 text-green-700': trendColor === 'green',
              'bg-red-100 text-red-700': trendColor === 'red',
            }
          )}>
            {trendDirection === 'up' ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
