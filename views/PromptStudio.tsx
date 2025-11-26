import React from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { PromptTemplate } from '../types';

interface PromptStudioProps {
  template: PromptTemplate;
  setTemplate: (t: PromptTemplate) => void;
}

const PromptStudio: React.FC<PromptStudioProps> = ({ template, setTemplate }) => {
  
  const handleSystemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate({ ...template, systemInstruction: e.target.value });
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate({ ...template, userPromptTemplate: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prompt Studio</h1>
          <p className="text-slate-500 mt-1">Fine-tune the instructions sent to Gemini to align with your brand voice.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
            <Save size={18} />
            <span>Save Configuration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Prompt */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">System Instruction</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">Static Context</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
                Defines the persona and rules the AI must follow.
            </p>
            <textarea 
                className="w-full h-96 p-4 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50"
                value={template.systemInstruction}
                onChange={handleSystemChange}
            />
        </div>

        {/* User Prompt Template */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">User Prompt Template</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">Dynamic</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
                Use variables <code className="bg-slate-100 px-1 rounded text-red-500">{'{{adGroup}}'}</code>, <code className="bg-slate-100 px-1 rounded text-red-500">{'{{keywords}}'}</code> to inject CSV data.
            </p>
            <textarea 
                className="w-full h-96 p-4 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50"
                value={template.userPromptTemplate}
                onChange={handleUserChange}
            />
        </div>
      </div>
      
      {/* Test Section (Visual only for this file) */}
      <div className="bg-indigo-900 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <h4 className="font-bold">Pro Tip</h4>
            <p className="text-indigo-200 text-sm mt-1">Use the "Reasoning" field in the output to understand why Gemini chose specific angles. Adjust the System Instruction to strictly enforce "Certification First" messaging if needed.</p>
          </div>
          <RefreshCw className="opacity-50" size={48} />
      </div>
    </div>
  );
};

export default PromptStudio;