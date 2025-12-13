import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import KnowledgeBase from './views/KnowledgeBase';
import AdGenerator from './views/AdGenerator';
import PromptStudio from './views/PromptStudio';
import KeywordLab from './views/KeywordLab';
import AuditCenter from './views/AuditCenter';
import Experiments from './views/Experiments';
import Settings from './views/Settings';
import { AppView, UploadedDocument, PromptTemplate } from './types';
import { db } from './services/db';

const DEFAULT_TEMPLATE: PromptTemplate = {
  id: 'default-v1',
  name: 'IT Training Specialist',
  isDefault: true,
  systemInstruction: `You are a world-class Google Ads copywriter specializing in High-End IT Training & Certifications. 

Your goal is to write high-CTR, lead-generating Responsive Search Ads (RSAs).

TONE: Professional, Authoritative, Benefit-Driven.
RULES:
1. Headlines must be under 30 characters.
2. Long Headlines (for PMax) under 90 characters.
3. Descriptions must be under 90 characters.
4. Use facts from the provided REFERENCE DOCS matching the topic.
5. Return JSON format.`,
  userPromptTemplate: `
Context:
{{keywords}}

Campaign: {{campaign}}
Ad Group: {{adGroup}}
Target URL: {{landingPage}}

Task:
Write 5 distinct headlines and 3 descriptions.
Explain your reasoning.
`
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [loadingDB, setLoadingDB] = useState(true);
  
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate>(DEFAULT_TEMPLATE);

  useEffect(() => {
    const initData = async () => {
      try {
        await db.init();
        
        const storedDocs = await db.getAllDocuments();
        setDocuments(storedDocs);

        const storedTemplate = await db.getTemplate('default-v1');
        if (storedTemplate) {
          setPromptTemplate(storedTemplate);
        } else {
          await db.saveTemplate(DEFAULT_TEMPLATE);
        }

      } catch (e) {
        console.error("DB Init Failed:", e);
      } finally {
        setLoadingDB(false);
      }
    };

    initData();
  }, []);

  if (loadingDB) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="font-medium">Initializing Persistent Backend...</div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard onNavigate={setCurrentView} />;
      case AppView.KNOWLEDGE_BASE: return <KnowledgeBase documents={documents} setDocuments={setDocuments} />;
      case AppView.AD_GENERATOR: return <AdGenerator documents={documents} promptTemplate={promptTemplate} />;
      case AppView.PROMPT_STUDIO: return <PromptStudio template={promptTemplate} setTemplate={setPromptTemplate} />;
      case AppView.KEYWORD_LAB: return <KeywordLab />;
      case AppView.AUDIT_CENTER: return <AuditCenter />;
      case AppView.EXPERIMENTS: return <Experiments />;
      case AppView.SETTINGS: return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;