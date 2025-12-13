import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Database,
  Wand2,
  TerminalSquare,
  Search as SearchIcon,
  Settings,
  Stethoscope,
  FlaskConical,
  Command,
  ArrowRight,
  FileText,
  Zap,
  X
} from 'lucide-react';
import { AppView } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'action' | 'recent';
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'dashboard', label: 'Dashboard', description: 'View marketing overview', icon: <LayoutDashboard size={18} />, action: () => onNavigate(AppView.DASHBOARD), category: 'navigation' },
    { id: 'knowledge', label: 'Knowledge Base', description: 'Manage documents', icon: <Database size={18} />, action: () => onNavigate(AppView.KNOWLEDGE_BASE), category: 'navigation' },
    { id: 'generator', label: 'Ad Generator', description: 'Create AI-powered ads', icon: <Wand2 size={18} />, action: () => onNavigate(AppView.AD_GENERATOR), category: 'navigation' },
    { id: 'keywords', label: 'Keyword Lab', description: 'Research keywords', icon: <SearchIcon size={18} />, action: () => onNavigate(AppView.KEYWORD_LAB), category: 'navigation' },
    { id: 'audit', label: 'Audit Center', description: 'Account health check', icon: <Stethoscope size={18} />, action: () => onNavigate(AppView.AUDIT_CENTER), category: 'navigation' },
    { id: 'experiments', label: 'Experiments', description: 'A/B testing', icon: <FlaskConical size={18} />, action: () => onNavigate(AppView.EXPERIMENTS), category: 'navigation' },
    { id: 'prompts', label: 'Prompt Studio', description: 'Customize AI prompts', icon: <TerminalSquare size={18} />, action: () => onNavigate(AppView.PROMPT_STUDIO), category: 'navigation' },
    { id: 'settings', label: 'Settings', description: 'App configuration', icon: <Settings size={18} />, action: () => onNavigate(AppView.SETTINGS), category: 'navigation' },
    // Actions
    { id: 'new-ad', label: 'Generate New Ad', description: 'Quick ad creation', icon: <Zap size={18} />, action: () => onNavigate(AppView.AD_GENERATOR), category: 'action' },
    { id: 'upload', label: 'Upload Document', description: 'Add to knowledge base', icon: <FileText size={18} />, action: () => onNavigate(AppView.KNOWLEDGE_BASE), category: 'action' },
  ];

  const filteredCommands = query
    ? commands.filter(cmd =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
    )
    : commands;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
            setQuery('');
          }
          break;
        case 'Escape':
          onClose();
          setQuery('');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    action: filteredCommands.filter(c => c.category === 'action'),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          onClose();
          setQuery('');
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
          <Search size={20} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, navigate, or take action..."
            className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-medium">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {groupedCommands.navigation.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Navigation
                  </p>
                  {groupedCommands.navigation.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                          setQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${globalIndex === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                        <span className={`p-1.5 rounded-lg ${globalIndex === selectedIndex ? 'bg-blue-100 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'}`}>
                          {cmd.icon}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-slate-400">{cmd.description}</p>
                          )}
                        </div>
                        {globalIndex === selectedIndex && (
                          <ArrowRight size={16} className="text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {groupedCommands.action.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Quick Actions
                  </p>
                  {groupedCommands.action.map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                          setQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${globalIndex === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                        <span className={`p-1.5 rounded-lg ${globalIndex === selectedIndex ? 'bg-blue-100 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'}`}>
                          {cmd.icon}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-slate-400">{cmd.description}</p>
                          )}
                        </div>
                        {globalIndex === selectedIndex && (
                          <ArrowRight size={16} className="text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command size={12} />
            <span>+ K to open</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
