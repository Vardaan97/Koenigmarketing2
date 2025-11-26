import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Tag, BrainCircuit, Link2, Edit2, Save, FolderOpen, List, Network, Search, Filter, Database, RefreshCw, XCircle } from 'lucide-react';
import { UploadedDocument, DocCategory } from '../types';
import { correlateDocuments, generateContentHash, generateSimulatedVector } from '../services/geminiService';

interface KnowledgeBaseProps {
  documents: UploadedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
}

const CATEGORIES: { value: DocCategory; label: string; color: string; hex: string }[] = [
  { value: 'COURSE_CONTENT', label: 'Course Content', color: 'bg-blue-100 text-blue-700', hex: '#3b82f6' },
  { value: 'PAST_PERFORMANCE', label: 'Performance Report', color: 'bg-emerald-100 text-emerald-700', hex: '#10b981' },
  { value: 'STRATEGY_BRIEF', label: 'Strategy Brief', color: 'bg-purple-100 text-purple-700', hex: '#a855f7' },
  { value: 'COMPETITOR_INFO', label: 'Competitor Info', color: 'bg-orange-100 text-orange-700', hex: '#f97316' },
  { value: 'UNCATEGORIZED', label: 'General Info', color: 'bg-slate-100 text-slate-700', hex: '#64748b' },
];

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents, setDocuments }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<DocCategory>('UNCATEGORIZED');
  
  // Initialize analysis from storage
  const [correlationAnalysis, setCorrelationAnalysis] = useState<string | null>(() => {
    return localStorage.getItem('adgenius_kb_analysis') || null;
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'GRAPH'>('LIST');
  const [ingestStats, setIngestStats] = useState<{added: number, skipped: number} | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<'DATE' | 'NAME' | 'SIZE'>('DATE');

  // Save analysis when it changes
  useEffect(() => {
    if (correlationAnalysis) {
        localStorage.setItem('adgenius_kb_analysis', correlationAnalysis);
    } else {
        localStorage.removeItem('adgenius_kb_analysis');
    }
  }, [correlationAnalysis]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await handleDeltaIngest(Array.from(files));
    }
  };

  const handleDeltaIngest = async (files: File[]) => {
    let addedCount = 0;
    let skippedCount = 0;
    const newDocs: UploadedDocument[] = [];

    for (const file of files) {
      const text = await readFileContent(file);
      const hash = generateContentHash(text, file.name);

      // Delta Check: Does this hash exist?
      const exists = documents.some(d => d.hash === hash);

      if (exists) {
        skippedCount++;
        continue;
      }

      // Default categorization based on name (mock intelligence)
      let cat: DocCategory = 'UNCATEGORIZED';
      const nameLower = file.name.toLowerCase();
      if (nameLower.includes('course') || nameLower.includes('syllabus')) cat = 'COURSE_CONTENT';
      else if (nameLower.includes('report') || nameLower.includes('metric')) cat = 'PAST_PERFORMANCE';
      else if (nameLower.includes('competitor')) cat = 'COMPETITOR_INFO';
      else if (nameLower.includes('brief') || nameLower.includes('strategy')) cat = 'STRATEGY_BRIEF';

      // Generate Vector Position
      const vector = generateSimulatedVector(cat);

      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        hash: hash,
        name: file.name,
        type: file.type,
        size: file.size,
        content: text,
        uploadDate: new Date().toLocaleDateString(),
        tags: ['New Upload'],
        description: "No description provided. Click to add context.",
        category: cat,
        vectorX: vector.x,
        vectorY: vector.y
      };
      
      newDocs.push(newDoc);
      addedCount++;
    }

    if (newDocs.length > 0) {
        setDocuments(prev => [...prev, ...newDocs]);
    }
    setIngestStats({ added: addedCount, skipped: skippedCount });
    
    // Clear stats after 5 seconds
    setTimeout(() => setIngestStats(null), 5000);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file); 
    });
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete ALL documents? This cannot be undone.")) {
        setDocuments([]);
        setCorrelationAnalysis(null);
    }
  };

  const startEdit = (doc: UploadedDocument) => {
    setEditingId(doc.id);
    setEditDesc(doc.description);
    setEditCategory(doc.category);
  };

  const saveEdit = (id: string) => {
    setDocuments(prev => {
        return prev.map(d => {
            if (d.id === id) {
                 // Update vector position if category changed or if missing
                 const shouldRegenerate = d.category !== editCategory || d.vectorX === undefined;
                 const vector = shouldRegenerate 
                    ? generateSimulatedVector(editCategory) 
                    : {x: d.vectorX!, y: d.vectorY!};

                 return { ...d, description: editDesc, category: editCategory, vectorX: vector.x, vectorY: vector.y };
            }
            return d;
        });
    });
    setEditingId(null);
  };

  const runCorrelation = async () => {
    setAnalyzing(true);
    try {
        const result = await correlateDocuments(documents);
        setCorrelationAnalysis(result);
    } catch (e) {
        setCorrelationAnalysis("Error generating analysis. Please try again.");
    }
    setAnalyzing(false);
  };

  // Filter Logic
  const filteredDocs = documents
    .filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              doc.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = filterCategory === 'ALL' || doc.category === filterCategory;
        return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
        if (sortBy === 'NAME') return a.name.localeCompare(b.name);
        if (sortBy === 'SIZE') return b.size - a.size;
        // Date sort - simplified for string dates
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
            <p className="text-slate-500 mt-1">Innovative vector storage with delta ingestion. Data persists forever locally.</p>
            </div>
            <div className="flex gap-2">
                {documents.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                    >
                        <XCircle size={18} />
                        Clear All
                    </button>
                )}
                <button 
                    onClick={runCorrelation}
                    disabled={documents.length < 2 || analyzing}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border shadow-sm
                        ${documents.length < 2 
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:shadow-md'}
                    `}
                >
                    <BrainCircuit size={18} />
                    {analyzing ? 'Reasoning (Gemini 3 Pro)...' : 'Analyze Connections'}
                </button>
            </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
             <div className="flex gap-6">
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'LIST' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <List size={16} /> Table View
                </button>
                <button 
                    onClick={() => setViewMode('GRAPH')}
                    className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'GRAPH' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Network size={16} /> Graphical Vector DB
                </button>
             </div>
             
             {/* Ingest Status Toast */}
             {ingestStats && (
                 <div className="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full animate-in fade-in slide-in-from-right-4 flex items-center gap-2">
                     <RefreshCw size={12} />
                     Delta Ingest: {ingestStats.added} added, {ingestStats.skipped} duplicates skipped.
                 </div>
             )}
        </div>
      </div>

      {/* Correlation Result */}
      {correlationAnalysis && (
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4 flex-shrink-0">
              <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 border border-indigo-50">
                      <Link2 size={24} />
                  </div>
                  <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-indigo-900">Knowledge Graph Insights (Gemini 3 Pro)</h3>
                        <button onClick={() => setCorrelationAnalysis(null)} className="text-indigo-400 hover:text-indigo-600">
                            Close
                        </button>
                      </div>
                      <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {correlationAnalysis}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'LIST' ? (
        <div className="flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent w-full md:w-64">
                    <Search size={16} className="text-slate-400" />
                    <input 
                        className="text-sm outline-none text-slate-700 w-full placeholder:text-slate-400"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                        <Filter size={14} className="text-slate-400" />
                        <select 
                            className="text-sm bg-transparent outline-none text-slate-600 cursor-pointer"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="ALL">All Categories</option>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-1">Sort</span>
                        <select 
                            className="text-sm bg-transparent outline-none text-slate-600 cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="DATE">Newest</option>
                            <option value="NAME">Name (A-Z)</option>
                            <option value="SIZE">Size</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
                {filteredDocs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <Database size={48} className="opacity-20 mb-4" />
                        <p>No documents found matching your filters.</p>
                        <p className="text-xs mt-2">Try uploading new files or clearing filters.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {filteredDocs.map((doc) => {
                            const catInfo = CATEGORIES.find(c => c.value === doc.category) || CATEGORIES[4];
                            return (
                                <li key={doc.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 mt-1 bg-slate-100 text-slate-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-[10px] uppercase border border-slate-200">
                                            {doc.type.split('/')[1] || 'FILE'}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900 truncate pr-4">{doc.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    {editingId !== doc.id && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${catInfo.color}`}>
                                                            {catInfo.label}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-400 font-mono">{(doc.size / 1024).toFixed(1)} KB</span>
                                                    <button onClick={() => handleDelete(doc.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {editingId === doc.id ? (
                                                <div className="mt-3 bg-white border border-blue-200 rounded-lg p-3 shadow-sm ring-4 ring-blue-50/50">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Description</label>
                                                            <input 
                                                                autoFocus
                                                                className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 outline-none"
                                                                value={editDesc}
                                                                onChange={(e) => setEditDesc(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Category</label>
                                                            <select 
                                                                className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 outline-none bg-white"
                                                                value={editCategory}
                                                                onChange={(e) => setEditCategory(e.target.value as DocCategory)}
                                                            >
                                                                {CATEGORIES.map(c => (
                                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                                                        <button onClick={() => saveEdit(doc.id)} className="px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center gap-1">
                                                            <Save size={12} /> Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="group/desc mt-1 cursor-pointer" onClick={() => startEdit(doc)}>
                                                    <div className="flex items-start gap-2">
                                                        <p className="text-sm text-slate-500 line-clamp-2 hover:text-blue-600 transition-colors">
                                                            {doc.description}
                                                        </p>
                                                        <Edit2 size={12} className="text-slate-300 opacity-0 group-hover/desc:opacity-100 mt-1" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Upload Footer */}
            <div 
                className="p-4 border-t border-slate-200 bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={18} />
                <span className="font-medium">Upload New Data (Delta Ingest Active)</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept=".txt,.md,.csv,.json" onChange={handleFileUpload} />
            </div>
        </div>
      ) : (
        /* GRAPH VIEW */
        <div className="flex-1 min-h-0 bg-slate-900 rounded-xl overflow-hidden relative shadow-inner">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur p-2 rounded-lg border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Cluster Legend</h4>
                <div className="space-y-1">
                    {CATEGORIES.map(c => (
                        <div key={c.value} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: c.hex}}></div>
                            <span className="text-[10px] text-slate-300">{c.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Simulated Vector Space SVG */}
            {documents.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <BrainCircuit size={48} className="opacity-20 mb-4" />
                    <p>Upload data to visualize the Knowledge Graph.</p>
                </div>
            ) : (
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                     {/* Draw Links (Simulated nearby neighbors) */}
                     {documents.map((d1, i) => (
                         documents.slice(i+1).map((d2, j) => {
                             // Draw a line if they are "close" in vector space
                             const x1 = d1.vectorX ?? 50;
                             const y1 = d1.vectorY ?? 50;
                             const x2 = d2.vectorX ?? 50;
                             const y2 = d2.vectorY ?? 50;

                             const dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
                             if (dist < 20) {
                                 return (
                                     <line 
                                        key={`${d1.id}-${d2.id}`}
                                        x1={x1} y1={y1}
                                        x2={x2} y2={y2}
                                        stroke="#334155"
                                        strokeWidth="0.2"
                                        opacity="0.5"
                                     />
                                 )
                             }
                             return null;
                         })
                     ))}

                     {/* Draw Nodes */}
                     {documents.map((doc) => {
                         const color = CATEGORIES.find(c => c.value === doc.category)?.hex || '#cbd5e1';
                         const vx = doc.vectorX ?? 50;
                         const vy = doc.vectorY ?? 50;
                         
                         return (
                             <g key={doc.id} className="group cursor-pointer">
                                 {/* Hover Ring */}
                                 <circle 
                                    cx={vx} cy={vy} 
                                    r="4" 
                                    fill={color} 
                                    opacity="0"
                                    className="group-hover:opacity-20 transition-opacity"
                                 />
                                 {/* Core Node */}
                                 <circle 
                                    cx={vx} cy={vy} 
                                    r="1.5" 
                                    fill={color} 
                                 />
                                 {/* Label */}
                                 <text 
                                    x={vx} y={vy - 3} 
                                    fontSize="2" 
                                    fill="white" 
                                    textAnchor="middle" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none font-bold"
                                    style={{textShadow: '0px 1px 2px black'}}
                                 >
                                     {doc.name.substring(0, 15)}...
                                 </text>
                             </g>
                         )
                     })}
                </svg>
            )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;