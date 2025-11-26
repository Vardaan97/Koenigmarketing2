import React, { useState } from 'react';
import { Stethoscope, AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { performAccountAudit } from '../services/geminiService';
import { AuditIssue } from '../types';

const AuditCenter: React.FC = () => {
    const [issues, setIssues] = useState<AuditIssue[]>([]);
    const [scanning, setScanning] = useState(false);
    const [lastScan, setLastScan] = useState<string | null>(null);

    const runAudit = async () => {
        setScanning(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const results = await performAccountAudit();
        setIssues(results);
        setLastScan(new Date().toLocaleTimeString());
        setScanning(false);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-100';
            case 'WARNING': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertCircle size={20} />;
            case 'WARNING': return <AlertTriangle size={20} />;
            case 'INFO': return <Info size={20} />;
            default: return <Info size={20} />;
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Smart Audit Center</h1>
                    <p className="text-slate-500 mt-1">Real-time API analysis of account health, wasted spend, and optimization opportunities.</p>
                </div>
                <button 
                    onClick={runAudit}
                    disabled={scanning}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all
                        ${scanning 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-0.5'}
                    `}
                >
                    <RefreshCw size={20} className={scanning ? "animate-spin" : ""} />
                    {scanning ? 'Running Deep Scan...' : 'Run Live Audit'}
                </button>
            </div>

            {/* Health Scorecard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Account Health</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-slate-900">{issues.length > 0 ? '78' : '--'}</span>
                            <span className="text-sm text-slate-400">/ 100</span>
                        </div>
                        {issues.length > 0 && (
                            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Optimization score top 20%
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Est. Wasted Spend</h3>
                        <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-extrabold text-slate-900">{issues.length > 0 ? '$1,240' : '--'}</span>
                             <span className="text-sm text-slate-400">/ mo</span>
                        </div>
                        {issues.length > 0 && (
                            <p className="text-xs text-red-500 font-medium mt-2">
                                Primarily from Broad Match keywords
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Experiments</h3>
                        <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-extrabold text-slate-900">2</span>
                             <span className="text-sm text-slate-400">Running</span>
                        </div>
                        <p className="text-xs text-blue-600 font-medium mt-2">
                            1 result ready for review
                        </p>
                    </div>
                </div>
            </div>

            {/* Issues List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Stethoscope size={18} />
                        Detected Issues & Opportunities
                    </h3>
                    {lastScan && <span className="text-xs text-slate-400">Last scanned: {lastScan}</span>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {issues.length === 0 && !scanning ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                            <Stethoscope size={48} className="mb-4 opacity-20" />
                            <p>Run a scan to detect anomalies in your Google Ads account.</p>
                        </div>
                    ) : (
                        issues.map((issue, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-white animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 100}ms`}}>
                                {/* Icon & Severity */}
                                <div className="flex md:flex-col items-center md:items-start gap-3 md:w-32 flex-shrink-0">
                                    <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                                        {getSeverityIcon(issue.severity)}
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                                        {issue.severity}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">{issue.category}</span>
                                        <h4 className="font-bold text-slate-900 text-lg">{issue.title}</h4>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-3">
                                        {issue.description} <span className="font-semibold text-red-600">Impact: {issue.impact}</span>
                                    </p>
                                    
                                    {/* AI Insight */}
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-900 flex gap-3">
                                        <div className="bg-white p-1 rounded-full h-fit shadow-sm text-indigo-600 mt-0.5">
                                            <RefreshCw size={12} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-indigo-700 block text-xs uppercase mb-1">AI Recommendation</span>
                                            {issue.aiRecommendation}
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex flex-col justify-center gap-2 md:border-l border-slate-100 md:pl-4">
                                    <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2 whitespace-nowrap">
                                        Apply Fix
                                        <ArrowRight size={14} />
                                    </button>
                                    <button className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-800">
                                        Ignore
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditCenter;