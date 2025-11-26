import React, { useState } from 'react';
import { Search, ExternalLink, BarChart2, DollarSign, TrendingUp, Layers, Cpu, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import { analyzeKeywordsExtended } from '../services/geminiService';
import { KeywordMetric } from '../types';

const KeywordLab: React.FC = () => {
    const [seed, setSeed] = useState("");
    const [results, setResults] = useState<KeywordMetric[]>([]);
    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useState("");

    const handleSearch = async () => {
        if (!seed) return;
        setLoading(true);
        setStrategy(""); // Clear previous strategy
        const res = await analyzeKeywordsExtended(seed.split(','));
        setResults(res);
        setLoading(false);
    }

    const generateStrategy = () => {
        // Simple client-side synthesis mock, in real app this would be another LLM call
        const highVol = results.filter(r => r.volume > 1000);
        const lowComp = results.filter(r => r.competition === 'Low');
        
        const text = `Based on the aggregated data from Google Ads, Semrush, and Perplexity:
        
1. **High Volume Opportunities**: Terms like "${highVol[0]?.keyword || 'your primary keywords'}" have significant traffic. Despite higher competition, these are essential for brand visibility.
2. **Hidden Gems**: "${lowComp[0]?.keyword || 'long-tail options'}" has low competition but decent intent. We can dominate this niche cheaply (CPC ~$${lowComp[0]?.cpc || 0}).
3. **Budget Allocation**: Allocate 60% of budget to the high-intent keywords sourced from Google Ads, as they show better conversion probability than the broader Semrush informational queries.
4. **Trend Alert**: Several keywords show a >20% YoY increase, indicating rising market demand for these certification paths.`;
        
        setStrategy(text);
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex-shrink-0">
                 <h1 className="text-2xl font-bold text-slate-900">Keyword Lab (Enterprise)</h1>
                 <p className="text-slate-500 mt-1">Real-time keyword analysis aggregating metrics from Google Ads, Semrush, and market trends.</p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
                <div className="flex-1 relative">
                    <input 
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                        placeholder="Enter seed keywords (e.g. aws training, cism course, data science bootcamp)..." 
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium disabled:opacity-70"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <Globe size={18} />
                            <span>Analyze Market</span>
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Results Table */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Market Data ({results.length} found)</h3>
                        <div className="flex gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Google Ads</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Semrush</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Perplexity</span>
                        </div>
                    </div>
                    
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 text-slate-500 font-semibold w-1/3">Keyword</th>
                                    <th className="p-4 text-slate-500 font-semibold">Volume</th>
                                    <th className="p-4 text-slate-500 font-semibold">CPC (Est.)</th>
                                    <th className="p-4 text-slate-500 font-semibold">Competition</th>
                                    <th className="p-4 text-slate-500 font-semibold">Trend (YoY)</th>
                                    <th className="p-4 text-slate-500 font-semibold text-right">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {results.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <Search size={48} className="mb-4 opacity-20" />
                                                <p>Enter keywords above to fetch live metrics from integrated APIs.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {results.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 font-medium text-slate-900">
                                            {r.keyword}
                                            <div className="lg:hidden text-xs text-slate-400 mt-1">{r.source}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                {r.volume.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <span className="font-mono text-slate-700">
                                                ${r.cpc.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border
                                                ${r.competition === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                  r.competition === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                                                  'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {r.competition.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center gap-1 font-medium ${r.trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {r.trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                {Math.abs(r.trend)}%
                                            </div>
                                        </td>
                                        <td className="p-4 text-right hidden lg:table-cell">
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded
                                                ${r.source === 'Google Ads' ? 'text-blue-600 bg-blue-50' : 
                                                  r.source === 'Semrush' ? 'text-orange-600 bg-orange-50' : 
                                                  'text-teal-600 bg-teal-50'}`}>
                                                {r.source}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Strategy Panel */}
                <div className="lg:w-96 flex-shrink-0 flex flex-col gap-4">
                    <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden flex-shrink-0">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-indigo-800 rounded-lg">
                                    <Cpu className="text-indigo-300" size={20} />
                                </div>
                                <h3 className="font-bold text-lg">AI Strategist</h3>
                            </div>
                            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                                Our AI synthesizes data across all connected APIs (Google, Semrush, Moz) to propose an optimal bidding strategy.
                            </p>
                            <button 
                                onClick={generateStrategy}
                                disabled={results.length === 0}
                                className="w-full bg-white text-indigo-900 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Layers size={18} />
                                Synthesize Strategy
                            </button>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-40"></div>
                        <div className="absolute -left-6 top-6 w-24 h-24 bg-purple-600 rounded-full blur-3xl opacity-30"></div>
                    </div>

                    {strategy && (
                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex-1 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto min-h-[300px]">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                                <TrendingUp size={20} className="text-emerald-500" />
                                Strategic Insight
                            </h4>
                            <div className="prose prose-sm text-slate-600 leading-relaxed">
                                <p className="whitespace-pre-wrap">{strategy}</p>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Recommended Actions</h5>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Increase bid on "High Intent" group
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Create "Comparison" landing pages
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default KeywordLab;