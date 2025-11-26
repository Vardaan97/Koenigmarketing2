import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Tag, CheckCircle, BrainCircuit, Link2, Edit2, Save, FolderOpen } from 'lucide-react';
import { UploadedDocument, DocCategory } from '../types';
import { correlateDocuments } from '../services/geminiService';

interface KnowledgeBaseProps {
  documents: UploadedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
}

const CATEGORIES: { value: DocCategory; label: string; color: string }[] = [
  { value: 'COURSE_CONTENT', label: 'Course Content', color: 'bg-blue-100 text-blue-700' },
  { value: 'PAST_PERFORMANCE', label: 'Performance Report', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'STRATEGY_BRIEF', label: 'Strategy Brief', color: 'bg-purple-100 text-purple-700' },
  { value: 'COMPETITOR_INFO', label: 'Competitor Info', color: 'bg-orange-100 text-orange-700' },
  { value: 'UNCATEGORIZED', label: 'General Info', color: 'bg-slate-100 text-slate-700' },
];

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents, setDocuments }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<DocCategory>('UNCATEGORIZED');
  const [correlationAnalysis, setCorrelationAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const text = await readFileContent(file);
      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        content: text,
        uploadDate: new Date().toLocaleDateString(),
        tags: ['New Upload'],
        description: "No description provided. Click to add context.",
        category: 'UNCATEGORIZED'
      };
      setDocuments(prev => [...prev, newDoc]);
    }
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

  const startEdit = (doc: UploadedDocument) => {
    setEditingId(doc.id);
    setEditDesc(doc.description);
    setEditCategory(doc.category);
  };

  const saveEdit = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, description: editDesc, category: editCategory } : d));
    setEditingId(null);
  };

  const runCorrelation = async () => {
    setAnalyzing(true);
    const result = await correlateDocuments(documents);
    setCorrelationAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-500 mt-1">Upload and categorize your data. The AI uses "Categories" to understand how to use each file.</p>
        </div>
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
            {analyzing ? 'Analyzing Connections...' : 'Analyze Connections'}
        </button>
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
                        <h3 className="font-bold text-indigo-900">Knowledge Graph Insights</h3>
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

      {/* Upload Area */}
      <div 
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex-shrink-0 group
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50 bg-white'}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Upload Data Source</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Drag & drop or click to upload CSV reports, Text course content, or JSON API dumps.
        </p>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept=".txt,.md,.csv,.json" onChange={handleFileUpload} />
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
            <FolderOpen size={16} />
            Indexed Documents ({documents.length})
          </h3>
          <span className="text-xs text-slate-400">Click description to edit metadata</span>
        </div>
        
        <div className="overflow-y-auto flex-1 p-0">
            {documents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <FileText size={48} className="opacity-20 mb-4" />
                <p>No documents uploaded yet.</p>
            </div>
            ) : (
            <ul className="divide-y divide-slate-100">
                {documents.map((doc) => {
                    const catInfo = CATEGORIES.find(c => c.value === doc.category) || CATEGORIES[4];
                    return (
                        <li key={doc.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 mt-1 bg-slate-100 text-slate-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs">
                                    {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-slate-900 truncate pr-4">{doc.name}</h4>
                                        <div className="flex items-center gap-3">
                                            {editingId !== doc.id && (
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${catInfo.color}`}>
                                                    {catInfo.label}
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-400 font-mono">{(doc.size / 1024).toFixed(1)} KB</span>
                                            <button onClick={() => handleDelete(doc.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Mode vs View Mode */}
                                    {editingId === doc.id ? (
                                        <div className="mt-3 bg-white border border-blue-200 rounded-lg p-3 shadow-sm ring-4 ring-blue-50/50">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                <div className="md:col-span-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Description</label>
                                                    <input 
                                                        autoFocus
                                                        className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                        value={editDesc}
                                                        onChange={(e) => setEditDesc(e.target.value)}
                                                        placeholder="E.g. Q3 Cost Report for AWS Campaigns"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Category</label>
                                                    <select 
                                                        className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 outline-none bg-white"
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
                                                    <Save size={12} /> Save Changes
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

                                    {/* Tags */}
                                    <div className="flex gap-2 mt-3">
                                        {doc.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full flex items-center gap-1 border border-slate-200">
                                            <Tag size={10} /> {tag}
                                        </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;