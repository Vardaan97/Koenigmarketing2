import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { MarketInsight } from '../../types';

interface MarketInsightsProps {
  insights: MarketInsight[];
  loading?: boolean;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ insights, loading = false }) => {
  const getCategoryStyle = (category: MarketInsight['category']) => {
    switch (category) {
      case 'opportunity':
        return {
          icon: <Sparkles size={16} />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={16} />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700'
        };
      case 'trend':
        return {
          icon: <TrendingUp size={16} />,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'tip':
        return {
          icon: <Lightbulb size={16} />,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-700'
        };
    }
  };

  const getPriorityBadge = (priority: MarketInsight['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">AI Market Insights</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg bg-slate-50">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
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
          <Lightbulb size={18} className="text-yellow-500" />
          AI Market Insights
        </h3>
        <span className="text-xs text-slate-400">Powered by AI</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {insights.map((insight) => {
          const style = getCategoryStyle(insight.category);
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${style.bg} ${style.border} hover:shadow-sm transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${style.badge}`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${style.text}`}>
                      {insight.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{insight.description}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                    <ChevronRight size={14} />
                    {insight.actionable}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketInsights;
