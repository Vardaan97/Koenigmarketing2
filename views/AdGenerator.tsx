import React, { useState, useEffect } from 'react';
import { Upload, Play, Download, AlertCircle, FileSpreadsheet, Check, Database, CloudLightning, ArrowRight, Loader2 } from 'lucide-react';
import { AdGroupRow, PromptTemplate, UploadedDocument, GoogleAdsCampaign, GoogleAdsAdGroup } from '../types';
import { generateAdCopy } from '../services/geminiService';
import { googleAdsService } from '../services/googleAdsService';

interface AdGeneratorProps {
  documents: UploadedDocument[];
  promptTemplate: PromptTemplate;
}

const AdGenerator: React.FC<AdGeneratorProps> = ({ documents, promptTemplate }) => {
  // Load initial state from local storage if available
  const [rows, setRows] = useState<AdGroupRow[]>(() => {
    try {
        const saved = localStorage.getItem('adgenius_ad_rows');
        return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Import Mode State
  const [importMode, setImportMode] = useState<'CSV' | 'GADS'>('CSV');
  const [isConnected, setIsConnected] = useState(googleAdsService.isConnected());
  const [loadingGAds, setLoadingGAds] = useState(false);
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [adGroups, setAdGroups] = useState<GoogleAdsAdGroup[]>([]);
  const [selectedAdGroups, setSelectedAdGroups] = useState<Set<string>>(new Set());

  // Save to Local Storage on change
  useEffect(() => {
    localStorage.setItem('adgenius_ad_rows', JSON.stringify(rows));
  }, [rows]);

  // CSV Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      const parsedRows: AdGroupRow[] = [];
      
      lines.slice(1, 100).forEach((line) => {
        const cols = line.split(',');
        if (cols.length >= 2) {
            parsedRows.push({
                id: Math.random().toString(36).substr(2, 9),
                campaign: cols[0]?.trim() || "Generic IT Campaign",
                adGroup: cols[1]?.trim() || "General Training",
                keywords: cols[2]?.trim() || "it courses, certification",
                landingPage: cols[3]?.trim() || "https://example.com",
                status: 'PENDING'
            });
        }
      });
      setRows(prev => [...prev, ...parsedRows]);
    };
    reader.readAsText(file);
  };

  // Google Ads Handlers
  const handleGAdsConnect = async () => {
      setLoadingGAds(true);
      await googleAdsService.connect("123-456-7890");
      setIsConnected(true);
      const cmps = await googleAdsService.fetchCampaigns();
      setCampaigns(cmps);
      setLoadingGAds(false);
  };

  const handleCampaignSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cId = e.target.value;
      setSelectedCampaign(cId);
      if (cId) {
          setLoadingGAds(true);
          const ags = await googleAdsService.fetchAdGroups(cId);
          setAdGroups(ags);
          setLoadingGAds(false);
      } else {
          setAdGroups([]);
      }
  };

  const toggleAdGroup = (agId: string) => {
      const newSet = new Set(selectedAdGroups);
      if (newSet.has(agId)) newSet.delete(agId);
      else newSet.add(agId);
      setSelectedAdGroups(newSet);
  };

  const importFromGAds = async () => {
      setLoadingGAds(true);
      const newRows: AdGroupRow[] = [];
      const campaignName = campaigns.find(c => c.id === selectedCampaign)?.name || 'Imported Campaign';

      for (const agId of selectedAdGroups) {
          const ag = adGroups.find(g => g.id === agId);
          if (!ag) continue;
          
          // Fetch keywords via API
          const kws = await googleAdsService.fetchKeywords(agId);
          const kwString = kws.map(k => k.text).join(', ');

          newRows.push({
              id: Math.random().toString(36).substr(2, 9),
              campaign: campaignName,
              adGroup: ag.name,
              keywords: kwString,
              landingPage: "https://koenig-solutions.com/course", 
              status: 'PENDING'
          });
      }

      setRows(prev => [...prev, ...newRows]);
      setLoadingGAds(false);
      setImportMode('CSV');
      setSelectedAdGroups(new Set());
  };

  const startGeneration = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    let processedCount = 0;
    const newRows = [...rows];

    for (let i = 0; i < newRows.length; i++) {
        if (newRows[i].status === 'COMPLETED') continue;

        newRows[i] = { ...newRows[i], status: 'PROCESSING' };
        setRows([...newRows]);

        try {
            const result = await generateAdCopy(
                documents, 
                {
                    campaign: newRows[i].campaign,
                    adGroup: newRows[i].adGroup,
                    keywords: newRows[i].keywords,
                    landingPage: newRows[i].landingPage
                },
                promptTemplate
            );

            newRows[i] = { 
                ...newRows[i], 
                status: 'COMPLETED',
                generatedAd: result
            };
        } catch (error) {
            newRows[i] = { ...newRows[i], status: 'FAILED' };
        }

        processedCount++;
        setProgress(Math.round((processedCount / newRows.length) * 100));
        setRows([...newRows]);
        
        await new Promise(r => setTimeout(r, 500)); 
    }

    setIsProcessing(false);
  };

  const clearWorkspace = () => {
    if (confirm("Clear workspace?")) {
        setRows([]);
        localStorage.removeItem('adgenius_ad_rows');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Bulk Ad Generator</h1>
            <p className="text-slate-500 mt-1">Generates RSA & PMax copy. Workspace is autosaved.</p>
        </div>
        
        {/* Source Toggle */}
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button 
                onClick={() => setImportMode('CSV')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${importMode === 'CSV' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >
                 <FileSpreadsheet size={16} /> CSV Upload
             </button>
             <button 
                onClick={() => { setImportMode('GADS'); if(!isConnected) handleGAdsConnect(); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${importMode === 'GADS' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
                 <CloudLightning size={16} /> Google Ads
             </button>
        </div>
      </div>

      {/* IMPORT PANELS */}
      
      {/* 1. CSV MODE */}
      {importMode === 'CSV' && (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
               <input type="file" className="hidden" id="csv-upload" accept=".csv" onChange={handleFileUpload} />
               <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                   <Upload size={32} className="text-slate-400" />
                   <span className="font-medium text-slate-700">Drop your Campaign CSV here</span>
               </label>
          </div>
      )}

      {/* 2. GOOGLE ADS MODE */}
      {importMode === 'GADS' && (
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm ring-4 ring-blue-50/50 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                   <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><CloudLightning size={20} /></div>
                   <h3 className="font-bold text-slate-900">Import from Google Ads</h3>
              </div>

              {loadingGAds ? (
                  <div className="flex items-center gap-2 text-slate-500 py-4">
                      <Loader2 className="animate-spin" size={20} />
                      Fetching account data...
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Campaign Select */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Campaign</label>
                          <select 
                             className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                             value={selectedCampaign}
                             onChange={handleCampaignSelect}
                          >
                              <option value="">-- Choose Campaign --</option>
                              {campaigns.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>

                      {/* Ad Group Select */}
                      <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Ad Groups</label>
                          {adGroups.length > 0 ? (
                              <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto p-2 bg-slate-50 grid grid-cols-2 gap-2">
                                  {adGroups.map(ag => (
                                      <div 
                                        key={ag.id} 
                                        onClick={() => toggleAdGroup(ag.id)}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm border ${selectedAdGroups.has(ag.id) ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                                      >
                                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedAdGroups.has(ag.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                              {selectedAdGroups.has(ag.id) && <Check size={12} className="text-white" />}
                                          </div>
                                          <span className="truncate">{ag.name}</span>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-sm text-slate-400 italic p-2 border border-slate-200 rounded-lg bg-slate-50">
                                  Select a campaign to view ad groups...
                              </div>
                          )}
                      </div>
                  </div>
              )}

              <div className="flex justify-end pt-2">
                  <button 
                    onClick={importFromGAds}
                    disabled={selectedAdGroups.size === 0 || loadingGAds}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 flex items-center gap-2"
                  >
                      Import {selectedAdGroups.size} Ad Groups <ArrowRight size={16} />
                  </button>
              </div>
          </div>
      )}


      {/* Context Indicator */}
      {documents.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex-shrink-0">
              <Database size={14} className="text-blue-500" />
              <span>Active Context: {documents.length} knowledge assets available</span>
          </div>
      )}

      {/* Main Workspace Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
            <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">Workspace Rows: {rows.length}</span>
                {isProcessing && (
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-sm text-slate-500">{progress}%</span>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                {rows.length > 0 && (
                    <button onClick={clearWorkspace} className="px-4 py-2 text-slate-500 hover:text-red-600 font-medium">Clear</button>
                )}
                <button 
                    onClick={startGeneration}
                    disabled={rows.length === 0 || isProcessing}
                    className={`
                        flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                        ${rows.length === 0 || isProcessing 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'}
                    `}
                >
                    {isProcessing ? 'Generating...' : 'Generate Ads'}
                    {!isProcessing && <Play size={18} />}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-auto">
            {rows.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <FileSpreadsheet size={48} className="mb-4 opacity-50" />
                    <p>Import data from CSV or Google Ads to begin.</p>
                </div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 w-12">#</th>
                            <th className="p-4 w-48">Ad Group</th>
                            <th className="p-4 w-64">Keywords</th>
                            <th className="p-4">Generated Assets (RSA/PMax)</th>
                            <th className="p-4 w-24">Score</th>
                            <th className="p-4 w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                <td className="p-4 text-slate-400">{idx + 1}</td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-900">{row.adGroup}</div>
                                    <div className="text-xs text-slate-500">{row.campaign}</div>
                                </td>
                                <td className="p-4 text-slate-600 max-w-xs truncate">{row.keywords}</td>
                                <td className="p-4">
                                    {row.generatedAd ? (
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1 rounded">Headlines</span>
                                                <div className="text-slate-800 text-xs mt-1">
                                                    {row.generatedAd.headlines.slice(0, 3).map((h, i) => (
                                                        <span key={i} className="block">• {h}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {row.generatedAd.longHeadlines && (
                                                <div>
                                                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-1 rounded">PMax Long HL</span>
                                                    <div className="text-slate-800 text-xs mt-1">
                                                        {row.generatedAd.longHeadlines.slice(0, 1).map((h, i) => (
                                                            <span key={i} className="block">• {h}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1 rounded">Descriptions</span>
                                                <div className="text-slate-600 text-xs mt-1 truncate">
                                                    {row.generatedAd.descriptions[0]}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 italic">
                                                Reasoning: {row.generatedAd.reasoning.substring(0, 50)}...
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">Pending generation...</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {row.generatedAd && (
                                        <div className={`font-bold ${row.generatedAd.score > 80 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                            {row.generatedAd.score}/100
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {row.status === 'COMPLETED' && <Check className="text-emerald-500" size={18} />}
                                    {row.status === 'PROCESSING' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                                    {row.status === 'FAILED' && <AlertCircle className="text-red-500" size={18} />}
                                    {row.status === 'PENDING' && <div className="w-2 h-2 bg-slate-300 rounded-full"></div>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdGenerator;