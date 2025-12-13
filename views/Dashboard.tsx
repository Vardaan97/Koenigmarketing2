import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Zap,
  Target,
  FileText,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Quote,
  Sparkles
} from 'lucide-react';
import StatCard from '../components/StatCard';
import {
  NewsFeed,
  CertificationTrends,
  JobMarketWidget,
  ActivityTimeline,
  QuickActions,
  MarketInsights,
  TopAds,
  EventsCalendar
} from '../components/dashboard';
import {
  DashboardStats,
  TechNewsItem,
  CertificationTrend,
  JobMarketPulse,
  ActivityItem,
  TopPerformingAd,
  ITEvent,
  MarketInsight,
  AppView
} from '../types';
import {
  getDashboardStats,
  getCombinedNewsFeed,
  getCertificationTrends,
  getJobMarketPulse,
  getActivityTimeline,
  getTopPerformingAds,
  getUpcomingEvents,
  generateMarketInsights,
  getWeeklyPerformanceData,
  fetchTechQuote
} from '../services/dashboardService';

interface DashboardProps {
  onNavigate?: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // State for all dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [news, setNews] = useState<TechNewsItem[]>([]);
  const [certTrends, setCertTrends] = useState<CertificationTrend[]>([]);
  const [jobMarket, setJobMarket] = useState<JobMarketPulse | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [topAds, setTopAds] = useState<TopPerformingAd[]>([]);
  const [events, setEvents] = useState<ITEvent[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingJobMarket, setLoadingJobMarket] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    try {
      // Fetch data in parallel for performance
      const [
        statsData,
        newsData,
        jobData,
        activityData,
        adsData,
        weeklyChartData,
        quoteData
      ] = await Promise.all([
        getDashboardStats(),
        getCombinedNewsFeed(12),
        getJobMarketPulse(),
        getActivityTimeline(8),
        getTopPerformingAds(5),
        getWeeklyPerformanceData(),
        fetchTechQuote()
      ]);

      setStats(statsData);
      setNews(newsData);
      setJobMarket(jobData);
      setActivities(activityData);
      setTopAds(adsData);
      setWeeklyData(weeklyChartData);
      setQuote(quoteData);

      // These don't need async
      setCertTrends(getCertificationTrends());
      setEvents(getUpcomingEvents());
      setInsights(generateMarketInsights());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingStats(false);
      setLoadingNews(false);
      setLoadingJobMarket(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleRefreshNews = async () => {
    setLoadingNews(true);
    try {
      const newsData = await getCombinedNewsFeed(12);
      setNews(newsData);
    } finally {
      setLoadingNews(false);
    }
  };

  // Pie chart colors
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Ad status data for pie chart
  const statusData = stats ? [
    { name: 'Completed', value: stats.completedAds, color: '#10b981' },
    { name: 'Pending', value: stats.pendingAds, color: '#f59e0b' },
    { name: 'Failed', value: stats.failedAds, color: '#ef4444' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing Command Center</h1>
          <p className="text-slate-500 mt-1">
            Real-time insights for IT training marketing success
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all ${refreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Motivational Quote */}
      {quote && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white flex items-center gap-4">
          <Quote size={24} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm italic">"{quote.quote}"</p>
            <p className="text-xs text-slate-400 mt-1">- {quote.author}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ads Generated"
          value={stats?.totalAdsGenerated.toLocaleString() || '0'}
          trend={stats?.completedAds ? `${stats.completedAds} completed` : undefined}
          trendDirection="up"
          icon={Zap}
          color="blue"
          loading={loadingStats}
        />
        <StatCard
          title="Avg. Ad Strength"
          value={stats?.avgAdScore ? `${stats.avgAdScore}%` : '0%'}
          trend={stats?.avgAdScore && stats.avgAdScore > 80 ? 'Excellent quality' : 'Room to improve'}
          trendDirection={stats?.avgAdScore && stats.avgAdScore > 80 ? 'up' : 'neutral'}
          icon={Target}
          color="green"
          loading={loadingStats}
        />
        <StatCard
          title="Knowledge Assets"
          value={stats?.documentsIndexed || 0}
          subtitle="Documents indexed"
          icon={FileText}
          color="purple"
          loading={loadingStats}
          onClick={onNavigate ? () => onNavigate(AppView.KNOWLEDGE_BASE) : undefined}
        />
        <StatCard
          title="API Credits Used"
          value={stats?.creditsUsed || 0}
          subtitle={stats?.topCampaign ? `Top: ${stats.topCampaign}` : undefined}
          icon={CreditCard}
          color="orange"
          loading={loadingStats}
        />
      </div>

      {/* Quick Actions */}
      {onNavigate && <QuickActions onNavigate={onNavigate} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Weekly Performance
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Ads Generated
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Quality Score
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="ads" name="Ads" stroke="#3b82f6" fill="url(#colorAds)" strokeWidth={2} />
                  <Area type="monotone" dataKey="score" name="Score" stroke="#10b981" fill="url(#colorScore)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ad Status Distribution */}
          {statusData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" />
                  Ad Generation Status
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {statusData.map((status) => (
                    <div key={status.name} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></span>
                      <span className="text-slate-600">{status.name}: {status.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Ads */}
              <TopAds
                ads={topAds}
                loading={loadingStats}
                onViewAll={onNavigate ? () => onNavigate(AppView.AD_GENERATOR) : undefined}
              />
            </div>
          )}

          {/* News Feed */}
          <NewsFeed
            news={news}
            loading={loadingNews}
            onRefresh={handleRefreshNews}
          />
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Job Market Pulse */}
          <JobMarketWidget data={jobMarket} loading={loadingJobMarket} />

          {/* Certification Trends */}
          <CertificationTrends trends={certTrends} loading={loadingStats} />

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} loading={loadingStats} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Insights */}
        <MarketInsights insights={insights} loading={loadingStats} />

        {/* Events Calendar */}
        <EventsCalendar events={events} loading={loadingStats} />
      </div>

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ready to boost your IT training ads?</h3>
            <p className="text-blue-200 text-sm mt-1">
              Generate high-converting Google Ads with AI-powered insights
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate(AppView.AD_GENERATOR)}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <Zap size={18} />
              Generate Ads Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
