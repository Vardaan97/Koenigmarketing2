import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'pink' | 'indigo';
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon: Icon,
  color,
  subtitle,
  onClick,
  loading = false
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-500',
    neutral: 'text-slate-500'
  };

  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendColors[trendDirection]}`}>
                <TrendIcon size={14} />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
