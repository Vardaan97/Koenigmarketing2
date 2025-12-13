import React from 'react';
import { Trophy, Star, TrendingUp, Zap } from 'lucide-react';
import { TopPerformingAd } from '../../types';

interface TopAdsProps {
  ads: TopPerformingAd[];
  loading?: boolean;
  onViewAll?: () => void;
}

const TopAds: React.FC<TopAdsProps> = ({ ads, loading = false, onViewAll }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-slate-400';
      case 2: return 'text-amber-600';
      default: return 'text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          Top Performing Ads
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded"></div>
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
          <Trophy size={18} className="text-yellow-500" />
          Top Performing Ads
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        )}
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-8">
          <Zap size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">No ads generated yet</p>
          <p className="text-xs text-slate-300 mt-1">Generate ads to see top performers</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ads.map((ad, index) => (
            <div
              key={ad.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                <Trophy size={20} className={getMedalColor(index)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate" title={ad.headline}>
                  "{ad.headline}"
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 truncate">{ad.campaign}</span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs text-slate-400 truncate">{ad.adGroup}</span>
                </div>
              </div>

              {/* Score */}
              <div className={`flex-shrink-0 px-3 py-1 rounded-full font-semibold text-sm ${getScoreColor(ad.score)}`}>
                {ad.score}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance summary */}
      {ads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Avg. Score</span>
            <span className="font-semibold text-slate-700">
              {Math.round(ads.reduce((sum, ad) => sum + ad.score, 0) / ads.length)}
            </span>
          </div>
          {ads[0]?.estimatedCtr && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Est. Top CTR</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={12} />
                {ads[0].estimatedCtr.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopAds;
