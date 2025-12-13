import React from 'react';
import {
  Zap,
  Upload,
  Search,
  ClipboardList,
  TestTube,
  Settings,
  Sparkles,
  FileText,
  ArrowRight
} from 'lucide-react';
import { AppView } from '../../types';

interface QuickActionsProps {
  onNavigate: (view: AppView) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'generate',
      label: 'Generate Ads',
      description: 'Create new ad copy with AI',
      icon: Zap,
      view: AppView.AD_GENERATOR,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'upload',
      label: 'Upload Content',
      description: 'Add to knowledge base',
      icon: Upload,
      view: AppView.KNOWLEDGE_BASE,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'keywords',
      label: 'Research Keywords',
      description: 'Discover new opportunities',
      icon: Search,
      view: AppView.KEYWORD_LAB,
      color: 'from-cyan-500 to-cyan-600',
      hoverColor: 'hover:from-cyan-600 hover:to-cyan-700'
    },
    {
      id: 'audit',
      label: 'Run Audit',
      description: 'Analyze account health',
      icon: ClipboardList,
      view: AppView.AUDIT_CENTER,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700'
    },
    {
      id: 'experiments',
      label: 'A/B Tests',
      description: 'Manage experiments',
      icon: TestTube,
      view: AppView.EXPERIMENTS,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'prompts',
      label: 'Edit Prompts',
      description: 'Customize AI behavior',
      icon: Sparkles,
      view: AppView.PROMPT_STUDIO,
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-yellow-500" />
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.view)}
              className={`group relative p-4 rounded-xl bg-gradient-to-br ${action.color} ${action.hoverColor} text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex flex-col items-start gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-white/70">{action.description}</p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
