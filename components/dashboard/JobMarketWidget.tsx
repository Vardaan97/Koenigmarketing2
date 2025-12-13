import React from 'react';
import { Briefcase, DollarSign, MapPin, Wifi, TrendingUp, TrendingDown } from 'lucide-react';
import { JobMarketPulse } from '../../types';

interface JobMarketWidgetProps {
  data: JobMarketPulse | null;
  loading?: boolean;
}

const JobMarketWidget: React.FC<JobMarketWidgetProps> = ({ data, loading = false }) => {
  if (loading || !data) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-sm text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Briefcase size={18} />
          IT Job Market Pulse
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded w-1/2"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const isGrowthPositive = data.growthVsLastMonth >= 0;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-sm text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Briefcase size={18} />
          IT Job Market Pulse
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
          isGrowthPositive ? 'bg-emerald-400/30' : 'bg-red-400/30'
        }`}>
          {isGrowthPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isGrowthPositive ? '+' : ''}{data.growthVsLastMonth.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-3xl font-bold">{(data.totalJobs / 1000).toFixed(0)}K</p>
          <p className="text-xs text-indigo-200">Open Positions</p>
        </div>
        <div>
          <p className="text-3xl font-bold flex items-center">
            <DollarSign size={24} className="opacity-70" />
            {(data.avgSalary / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-indigo-200">Avg. Salary</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-indigo-200 mb-2 flex items-center gap-1">
          <Wifi size={12} /> {data.remotePercentage}% Remote
        </p>
        <div className="h-2 bg-indigo-400/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full"
            style={{ width: `${data.remotePercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="border-t border-indigo-400/30 pt-3">
        <p className="text-xs text-indigo-200 mb-2">Top Skills in Demand</p>
        <div className="flex flex-wrap gap-2">
          {data.topSkills.slice(0, 4).map((skill) => (
            <span
              key={skill.skill}
              className="text-xs px-2 py-1 bg-white/10 rounded-full"
            >
              {skill.skill}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-indigo-400/30 pt-3 mt-3">
        <p className="text-xs text-indigo-200 mb-2 flex items-center gap-1">
          <MapPin size={12} /> Top Locations
        </p>
        <div className="flex flex-wrap gap-2">
          {data.topLocations.slice(0, 3).map((loc) => (
            <span
              key={loc.location}
              className="text-xs px-2 py-1 bg-white/10 rounded-full"
            >
              {loc.location}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobMarketWidget;
