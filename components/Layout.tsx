import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Database,
  Wand2,
  TerminalSquare,
  Search,
  Settings as SettingsIcon,
  Menu,
  X,
  Stethoscope,
  FlaskConical,
  Moon,
  Sun,
  Command,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  HelpCircle
} from 'lucide-react';
import { AppView } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import CommandPalette from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { actualTheme, toggleTheme } = useTheme();

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: AppView.KNOWLEDGE_BASE, label: 'Knowledge Base', icon: Database, badge: null },
    { id: AppView.AD_GENERATOR, label: 'Ad Generator', icon: Wand2, badge: 'AI' },
    { id: AppView.KEYWORD_LAB, label: 'Keyword Lab', icon: Search, badge: null },
    { id: AppView.AUDIT_CENTER, label: 'Audit Center', icon: Stethoscope, badge: null },
    { id: AppView.EXPERIMENTS, label: 'Experiments', icon: FlaskConical, badge: null },
    { id: AppView.PROMPT_STUDIO, label: 'Prompt Studio', icon: TerminalSquare, badge: null },
  ];

  const handleNavClick = (view: AppView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => {
          onViewChange(view);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 dark:bg-slate-950 text-white transform transition-all duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        md:relative md:translate-x-0
        w-64
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">AdGenius AI</span>
              <p className="text-xs text-slate-500">IT Training Marketing</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search trigger */}
        <div className="p-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all group ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
          >
            <Search size={18} />
            <span className={`flex-1 text-left text-sm ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              Search...
            </span>
            <kbd className={`px-1.5 py-0.5 bg-slate-700 rounded text-[10px] font-medium group-hover:bg-slate-600 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              <Command size={10} className="inline mr-0.5" />K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isSidebarCollapsed ? 'md:justify-center' : ''}
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={`flex-shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span className={`font-medium text-sm whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'md:hidden md:opacity-0' : ''}`}>
                  {item.label}
                </span>
                {item.badge && !isSidebarCollapsed && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 w-full p-3 border-t border-slate-800 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
            title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
          >
            {actualTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className={`font-medium text-sm ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              {actualTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNavClick(AppView.SETTINGS)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isSidebarCollapsed ? 'md:justify-center' : ''} ${currentView === AppView.SETTINGS
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            title={isSidebarCollapsed ? 'Settings' : undefined}
          >
            <SettingsIcon size={20} />
            <span className={`font-medium text-sm ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Settings</span>
          </button>

          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className={`text-xs ${isSidebarCollapsed ? 'hidden' : ''}`}>Collapse</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Menu size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">AdGenius</span>
            </div>

            {/* Desktop search trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all min-w-[240px]"
            >
              <Search size={16} />
              <span className="text-sm">Search or jump to...</span>
              <kbd className="ml-auto px-1.5 py-0.5 bg-white dark:bg-slate-600 rounded text-[10px] font-medium shadow-sm">
                <Command size={10} className="inline mr-0.5" />K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Help */}
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <HelpCircle size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            {/* Theme toggle - mobile */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {actualTheme === 'light' ? (
                <Moon size={20} className="text-slate-600" />
              ) : (
                <Sun size={20} className="text-slate-400" />
              )}
            </button>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg hover:shadow-blue-500/25 transition-shadow">
              K
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
