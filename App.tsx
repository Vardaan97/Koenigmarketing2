import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import KnowledgeBase from './views/KnowledgeBase';
import AdGenerator from './views/AdGenerator';
import PromptStudio from './views/PromptStudio';
import KeywordLab from './views/KeywordLab';
import AuditCenter from './views/AuditCenter';
import Experiments from './views/Experiments';
import { AppView, UploadedDocument, PromptTemplate } from './types';

// Default prompt template suitable for IT Training
const DEFAULT_TEMPLATE: PromptTemplate = {
  id: 'default-v1',
  name: 'IT Training Specialist',
  isDefault: true,
  systemInstruction: `You are a world-class Google Ads copywriter specializing in High-End IT Training & Certifications (AWS, Azure, Cisco, CISSP, Data Science, AI). 

Your goal is to write high-CTR, lead-generating Responsive Search Ads (RSAs) and PMax Headlines.

TONE: Professional, Authoritative, Benefit-Driven, Urgent.
RULES:
1. Headlines must be under 30 characters.
2. Long Headlines (for PMax) under 90 characters.
3. Descriptions must be under 90 characters.
4. Focus on "Certified", "Career Growth", "Pass Guarantee", "Hands-on Labs".
5. Use facts from the provided REFERENCE DOCS matching the topic.
6. Return JSON format.`,
  userPromptTemplate: `
Context:
{{keywords}}

Campaign: {{campaign}}
Ad Group: {{adGroup}}
Target URL: {{landingPage}}

Task:
Write 5 distinct headlines and 3 descriptions for this ad group.
Ensure they are highly relevant to the keywords provided.
Explain your reasoning.
`
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Initialize from localStorage to ensure data is always there (Persistent Layer)
  const [documents, setDocuments] = useState<UploadedDocument[]>(() => {
    try {
      const saved = localStorage.getItem('adgenius_kb_docs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load docs", e);
      return [];
    }
  });

  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate>(DEFAULT_TEMPLATE);

  // Save to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('adgenius_kb_docs', JSON.stringify(documents));
  }, [documents]);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.KNOWLEDGE_BASE:
        return <KnowledgeBase documents={documents} setDocuments={setDocuments} />;
      case AppView.AD_GENERATOR:
        return <AdGenerator documents={documents} promptTemplate={promptTemplate} />;
      case AppView.PROMPT_STUDIO:
        return <PromptStudio template={promptTemplate} setTemplate={setPromptTemplate} />;
      case AppView.KEYWORD_LAB:
        return <KeywordLab />;
      case AppView.AUDIT_CENTER:
        return <AuditCenter />;
      case AppView.EXPERIMENTS:
        return <Experiments />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;