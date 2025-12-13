import React from 'react';
import { ExternalLink, MessageSquare, Star, Newspaper, Code, Github } from 'lucide-react';
import { TechNewsItem } from '../../types';

interface NewsFeedProps {
  news: TechNewsItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news, loading = false, onRefresh }) => {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'HackerNews': return <Newspaper size={14} className="text-orange-500" />;
      case 'DevTo': return <Code size={14} className="text-indigo-500" />;
      case 'GitHub': return <Github size={14} className="text-slate-700" />;
      default: return <Newspaper size={14} />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'HackerNews': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'DevTo': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'GitHub': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHrs > 0) return `${diffHrs}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">IT Industry News</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
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
          <Newspaper size={18} className="text-blue-500" />
          IT Industry News
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {news.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No news available</p>
        ) : (
          news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-blue-700">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${getSourceColor(item.source)}`}>
                      {getSourceIcon(item.source)}
                      {item.source}
                    </span>
                    {item.score && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" />
                        {item.score}
                      </span>
                    )}
                    {item.commentsCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {item.commentsCount}
                      </span>
                    )}
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0 mt-1" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
