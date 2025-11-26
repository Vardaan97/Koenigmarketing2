import React, { useState } from 'react';
import { FlaskConical, TrendingUp, TrendingDown, ArrowRight, BrainCircuit, Calendar, Check } from 'lucide-react';
import { Experiment } from '../types';
import { analyzeExperimentResults } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Experiments: React.FC = () => {
    // Mock Data simulating Google Ads Experiments API
    const [experiments, setExperiments] = useState<Experiment[]>([
        {
            id: 'exp-001',
            name: 'RSA Headline: Price vs Quality',
            startDate: '2023-10-01',
            status: 'RUNNING',
            variants: [
                {
                    name: 'Control (Price Focus)',
                    impressions: 15400,
                    clicks: 450,
                    conversions: 12,
                    cost: 1250,
                    ctr: 2.92,
                    cpa: 104.16,
                    roas: 2.1
                },
                {
                    name: 'Variant B (Quality Focus)',
                    impressions: 14800,
                    clicks: 590,
                    conversions: 24,
                    cost: 1300,
                    ctr: 3.98,
                    cpa: 54.16,
                    roas: 4.5
                }
            ]
        },
        {
            id: 'exp-002',
            name: 'Bidding: Max Conv vs tCPA',
            startDate: '2023-10-15',
            status: 'COMPLETED',
            variants: [
                {
                    name: 'Control (Max Conv)',
                    impressions: 8000,
                    clicks: 200,
                    conversions: 8,
                    cost: 600,
                    ctr: 2.5,
                    cpa: 75.00,
                    roas: 2.5
                },
                {
                    name: 'Variant B (tCPA $50)',
                    impressions: 7500,
                    clicks: 180,
                    conversions: 10,
                    cost: 550,
                    ctr: 2.4,
                    cpa: 55.00,
                    roas: 3.2
                }
            ]
        }
    ]);

    const [selectedExpId, setSelectedExpId] = useState<string>(experiments[0].id);
    const selectedExp = experiments.find(e => e.id === selectedExpId);
    const [analyzing, setAnalyzing] = useState(false);

    const runAnalysis = async () => {
        if (!selectedExp) return;
        setAnalyzing(true);
        const result = await analyzeExperimentResults(selectedExp);
        setExperiments(prev => prev.map(e => e.id === selectedExp.id ? { ...e, aiAnalysis: result } : e));
        setAnalyzing(false);
    };

    const formatDataForChart = (exp: Experiment) => [
        { name: 'CTR (%)', Control: exp.variants[0].ctr, VariantB: exp.variants[1].ctr },
        { name: 'ROAS (x)', Control: exp.variants[0].roas, VariantB: exp.variants[1].roas },
        { name: 'Conv. Rate (%)', Control: (exp.variants[0].conversions / exp.variants[0].clicks * 100).toFixed(1), VariantB: (exp.variants[1].conversions / exp.variants[1].clicks * 100).toFixed(1) }
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900">Experiment Tracker</h1>
                <p className="text-slate-500 mt-1">Monitor A/B tests and let AI determine the winner with statistical significance.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* List */}
                <div className="lg:w-80 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700">All Experiments</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {experiments.map(exp => (
                            <button 
                                key={exp.id}
                                onClick={() => setSelectedExpId(exp.id)}
                                className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors
                                    ${selectedExpId === exp.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${exp.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {exp.status}
                                    </span>
                                    <span className="text-xs text-slate-400">{exp.startDate}</span>
                                </div>
                                <h4 className={`font-semibold text-sm ${selectedExpId === exp.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                    {exp.name}
                                </h4>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                {selectedExp && (
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{selectedExp.name}</h2>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <Calendar size={14} />
                                    Started: {selectedExp.startDate}
                                    <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                                    <span className="font-mono text-xs bg-slate-100 px-1 rounded">ID: {selectedExp.id}</span>
                                </div>
                            </div>
                            <button 
                                onClick={runAnalysis}
                                disabled={analyzing}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md disabled:opacity-70"
                            >
                                <BrainCircuit size={18} />
                                {analyzing ? 'Analyzing Significance...' : 'AI Conclusion'}
                            </button>
                        </div>

                        {/* Metric Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Control: {selectedExp.variants[0].name}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-700">{selectedExp.variants[0].ctr}%</div>
                                        <div className="text-xs text-slate-400">CTR</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-700">{selectedExp.variants[0].roas}</div>
                                        <div className="text-xs text-slate-400">ROAS</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-700">${selectedExp.variants[0].cpa}</div>
                                        <div className="text-xs text-slate-400">CPA</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 relative">
                                <div className="absolute top-2 right-2 text-blue-500">
                                    <FlaskConical size={16} />
                                </div>
                                <h3 className="text-xs font-bold text-blue-500 uppercase mb-3">Test: {selectedExp.variants[1].name}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-700">{selectedExp.variants[1].ctr}%</div>
                                        <div className="text-xs text-blue-400">CTR</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-700">{selectedExp.variants[1].roas}</div>
                                        <div className="text-xs text-blue-400">ROAS</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-700">${selectedExp.variants[1].cpa}</div>
                                        <div className="text-xs text-blue-400">CPA</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-64 mb-6">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formatDataForChart(selectedExp)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                                    <Legend />
                                    <Bar dataKey="Control" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="VariantB" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* AI Analysis */}
                        {selectedExp.aiAnalysis && (
                             <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 border border-indigo-50">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-indigo-900 mb-2">Analysis Result</h3>
                                        <p className="text-indigo-800 text-sm leading-relaxed mb-4">
                                            {selectedExp.aiAnalysis}
                                        </p>
                                        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                            <Check size={14} />
                                            Apply Winner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Experiments;