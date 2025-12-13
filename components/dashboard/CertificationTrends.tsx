import React from 'react';
import { TrendingUp, Cloud, Server, Shield, Globe, Lock, Code, Clipboard, Container } from 'lucide-react';
import { CertificationTrend } from '../../types';

interface CertificationTrendsProps {
  trends: CertificationTrend[];
  loading?: boolean;
}

const CertificationTrends: React.FC<CertificationTrendsProps> = ({ trends, loading = false }) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      cloud: <Cloud size={16} className="text-orange-500" />,
      server: <Server size={16} className="text-blue-500" />,
      shield: <Shield size={16} className="text-green-600" />,
      container: <Container size={16} className="text-blue-600" />,
      globe: <Globe size={16} className="text-red-500" />,
      clipboard: <Clipboard size={16} className="text-purple-500" />,
      lock: <Lock size={16} className="text-cyan-600" />,
      code: <Code size={16} className="text-indigo-500" />
    };
    return iconMap[iconName] || <Cloud size={16} />;
  };

  const getDemandColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-slate-400';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">Certification Trends</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          Top Certifications
        </h3>
        <span className="text-xs text-slate-400">Market demand</span>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
        {trends.map((cert, index) => (
          <div
            key={cert.name}
            className="p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                {getIcon(cert.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{cert.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                    #{index + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{cert.provider}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-600">{cert.salaryImpact}</p>
                <p className="text-xs text-slate-400">+{cert.growthRate}% YoY</p>
              </div>
            </div>

            {/* Demand bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getDemandColor(cert.demandScore)}`}
                  style={{ width: `${cert.demandScore}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-600">{cert.demandScore}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{cert.jobCount.toLocaleString()} jobs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationTrends;
