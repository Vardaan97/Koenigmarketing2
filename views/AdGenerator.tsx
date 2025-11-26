import React, { useState } from 'react';
import { Upload, Play, Download, AlertCircle, FileSpreadsheet, Check, Database } from 'lucide-react';
import { AdGroupRow, PromptTemplate, UploadedDocument } from '../types';
import { generateAdCopy } from '../services/geminiService';

interface AdGeneratorProps {
  documents: UploadedDocument[];
  promptTemplate: PromptTemplate;
}

const AdGenerator: React.FC<AdGeneratorProps> = ({ documents, promptTemplate }) => {
  const [rows, setRows] = useState<AdGroupRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock parsing CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      const parsedRows: AdGroupRow[] = [];
      
      // Skip header, process 100 for demo
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
      setRows(parsedRows);
    };
    reader.readAsText(file);
  };

  const startGeneration = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Process in small batches
    let processedCount = 0;
    const newRows = [...rows];

    for (let i = 0; i < newRows.length; i++) {
        if (newRows[i].status === 'COMPLETED') continue;

        newRows[i] = { ...newRows[i], status: 'PROCESSING' };
        setRows([...newRows]);

        try {
            // Pass the full document objects, not just text
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Bulk Ad Generator</h1>
            <p className="text-slate-500 mt-1">Generates RSA & PMax copy using your Knowledge Base context + CSV structure.</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                <Download size={18} />
                <span>Template</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm shadow-blue-200">
                <Upload size={18} />
                <span>Upload CSV</span>
                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
        </div>
      </div>

      {/* Context Indicator */}
      {documents.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex-shrink-0">
              <Database size={14} className="text-blue-500" />
              <span>Active Context: {documents.length} knowledge assets available (Course Info, Reports, etc.)</span>
          </div>
      )}

      {/* Main Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
            <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">Rows: {rows.length}</span>
                {isProcessing && (
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-sm text-slate-500">{progress}%</span>
                    </div>
                )}
            </div>
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
                {isProcessing ? 'Generating...' : 'Run Generation'}
                {!isProcessing && <Play size={18} />}
            </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
            {rows.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <FileSpreadsheet size={48} className="mb-4 opacity-50" />
                    <p>No data loaded. Upload a CSV with headers: Campaign, AdGroup, Keywords, URL</p>
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