import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { FileText, Zap, Target, CreditCard } from 'lucide-react';
import StatCard from '../components/StatCard';
import { DashboardStats } from '../types';

const data = [
  { name: 'Mon', ads: 400, score: 78 },
  { name: 'Tue', ads: 300, score: 82 },
  { name: 'Wed', ads: 200, score: 85 },
  { name: 'Thu', ads: 278, score: 88 },
  { name: 'Fri', ads: 189, score: 92 },
  { name: 'Sat', ads: 239, score: 90 },
  { name: 'Sun', ads: 349, score: 95 },
];

const Dashboard: React.FC = () => {
  // Mock stats
  const stats: DashboardStats = {
    totalAdsGenerated: 12543,
    avgAdScore: 88.5,
    documentsIndexed: 42,
    creditsUsed: 1540
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketing Agent Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Your ad generation engines are optimized.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Ads Generated" 
          value={stats.totalAdsGenerated.toLocaleString()} 
          trend="12% vs last week"
          icon={Zap}
          color="blue"
        />
        <StatCard 
          title="Avg. Ad Strength" 
          value={`${stats.avgAdScore}%`} 
          trend="4.2% vs last week"
          icon={Target}
          color="green"
        />
        <StatCard 
          title="Knowledge Assets" 
          value={stats.documentsIndexed} 
          icon={FileText}
          color="purple"
        />
        <StatCard 
          title="API Credits Used" 
          value={stats.creditsUsed} 
          icon={CreditCard}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Generation Volume & Quality</h3>
            <select className="text-sm border border-slate-200 rounded-md px-2 py-1 outline-none text-slate-600">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="ads" name="Ads Generated" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-semibold text-slate-900">Ad Quality Trend</h3>
          </div>
           <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;