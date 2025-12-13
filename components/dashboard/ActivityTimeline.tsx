import React from 'react';
import { FileText, Zap, Search, TestTube, ClipboardCheck, Clock } from 'lucide-react';
import { ActivityItem } from '../../types';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ad_generated': return <Zap size={14} className="text-blue-500" />;
      case 'document_uploaded': return <FileText size={14} className="text-purple-500" />;
      case 'audit_completed': return <ClipboardCheck size={14} className="text-orange-500" />;
      case 'experiment_started': return <TestTube size={14} className="text-green-500" />;
      case 'keyword_researched': return <Search size={14} className="text-cyan-500" />;
      default: return <Clock size={14} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ad_generated': return 'bg-blue-50 border-blue-200';
      case 'document_uploaded': return 'bg-purple-50 border-purple-200';
      case 'audit_completed': return 'bg-orange-50 border-orange-200';
      case 'experiment_started': return 'bg-green-50 border-green-200';
      case 'keyword_researched': return 'bg-cyan-50 border-cyan-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHrs > 0) return `${diffHrs}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-slate-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Clock size={18} className="text-slate-400" />
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">No recent activity</p>
          <p className="text-xs text-slate-300 mt-1">Start generating ads or uploading documents</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start gap-3 pl-1">
                {/* Timeline dot */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0 pb-3">
                  <p className="text-sm font-medium text-slate-700">{activity.title}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  {activity.metadata?.score && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                      Score: {activity.metadata.score}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
