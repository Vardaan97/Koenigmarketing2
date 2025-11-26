import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedAd, PromptTemplate, KeywordMetric, UploadedDocument, AuditIssue, Experiment, DocCategory } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Utilities for Knowledge Base ---

// Simulates generating a content hash for deduplication
export const generateContentHash = (content: string, name: string): string => {
    let hash = 0;
    const combined = content + name;
    if (combined.length === 0) return hash.toString();
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
};

// Simulates vector embedding placement for the visualization
// Clusters similar categories together
export const generateSimulatedVector = (category: DocCategory) => {
    let baseX = 50;
    let baseY = 50;
    
    // Define cluster centers
    switch(category) {
        case 'COURSE_CONTENT': baseX = 20; baseY = 20; break; // Top Left
        case 'PAST_PERFORMANCE': baseX = 80; baseY = 20; break; // Top Right
        case 'STRATEGY_BRIEF': baseX = 50; baseY = 80; break; // Bottom Center
        case 'COMPETITOR_INFO': baseX = 80; baseY = 80; break; // Bottom Right
        case 'UNCATEGORIZED': baseX = 20; baseY = 80; break; // Bottom Left
    }

    // Add jitter/randomness
    const jitter = () => (Math.random() - 0.5) * 25;
    
    return {
        x: Math.max(5, Math.min(95, baseX + jitter())),
        y: Math.max(5, Math.min(95, baseY + jitter()))
    };
};

// --- Ad Generation ---

export const generateAdCopy = async (
  contextDocs: UploadedDocument[],
  adGroupData: { campaign: string; adGroup: string; keywords: string; landingPage: string },
  template: PromptTemplate
): Promise<GeneratedAd> => {
  
  if (!apiKey) throw new Error("API Key is missing.");

  const modelId = "gemini-2.5-flash"; 
  
  const courseDocs = contextDocs.filter(d => d.category === 'COURSE_CONTENT');
  const perfDocs = contextDocs.filter(d => d.category === 'PAST_PERFORMANCE');
  const strategyDocs = contextDocs.filter(d => d.category === 'STRATEGY_BRIEF');
  const competitorDocs = contextDocs.filter(d => d.category === 'COMPETITOR_INFO');
  const otherDocs = contextDocs.filter(d => d.category === 'UNCATEGORIZED');

  const formatDocSection = (title: string, docs: UploadedDocument[]) => {
    if (docs.length === 0) return "";
    return `\n--- ${title} ---\n` + docs.map(d => `FILE: ${d.name}\nDESC: ${d.description}\nCONTENT_SNIPPET: ${d.content.substring(0, 800)}...`).join('\n');
  };

  const contextString = contextDocs.length > 0 
    ? `\n\n=== KNOWLEDGE BASE CONTEXT ===\nUse the following structured data to inform your creative choices:` + 
      formatDocSection("COURSE SYLLABUS & DETAILS", courseDocs) +
      formatDocSection("PAST AD PERFORMANCE REPORTS", perfDocs) +
      formatDocSection("STRATEGY & BRAND GUIDELINES", strategyDocs) +
      formatDocSection("COMPETITOR ANALYSIS", competitorDocs) +
      formatDocSection("GENERAL INFO", otherDocs)
    : "";

  const userPrompt = template.userPromptTemplate
    .replace('{{campaign}}', adGroupData.campaign)
    .replace('{{adGroup}}', adGroupData.adGroup)
    .replace('{{keywords}}', adGroupData.keywords)
    .replace('{{landingPage}}', adGroupData.landingPage)
    + contextString;

  const adSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      headlines: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 5-10 RSA headlines (max 30 chars).",
      },
      longHeadlines: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 2-3 PMax long headlines (max 90 chars).",
      },
      descriptions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 3-5 descriptions (max 90 chars).",
      },
      score: {
        type: Type.NUMBER,
        description: "Predicted quality score 0-100.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Brief strategy explanation citing specific docs if used.",
      }
    },
    required: ["headlines", "descriptions", "score", "reasoning"],
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: template.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: adSchema,
        temperature: 0.7,
      },
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("No response");

    return JSON.parse(textResponse) as GeneratedAd;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- Keyword Analysis ---

export const analyzeKeywordsExtended = async (seedKeywords: string[]): Promise<KeywordMetric[]> => {
    const prompt = `
    Act as a Keyword Research API aggregator (Google Ads, Semrush, Moz).
    For the following seed keywords: ${seedKeywords.join(', ')}.
    
    Generate 8-12 related IT Training keywords (specifically for high-end certs like AWS, CISSP, Data Science).
    For each, assign realistic data based on current market trends:
    1. Volume (monthly searches, vary between 100 - 50,000)
    2. CPC (Cost Per Click in USD, high for IT training, e.g., $5-$50)
    3. Competition (High/Medium/Low)
    4. Trend (A percentage number between -20 and +120 indicating YoY growth)
    5. Source (Randomly assign 'Google Ads' or 'Semrush' or 'Perplexity')
    
    Return pure JSON.
    `;
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                keyword: { type: Type.STRING },
                volume: { type: Type.NUMBER },
                cpc: { type: Type.NUMBER },
                competition: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                trend: { type: Type.NUMBER },
                source: { type: Type.STRING, enum: ["Google Ads", "Semrush", "Perplexity"] }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
}

// --- Knowledge Correlation ---

export const correlateDocuments = async (docs: UploadedDocument[]): Promise<string> => {
    if (docs.length < 2) return "Not enough documents to correlate. Please upload at least 2 files.";

    const docList = docs.map(d => `- [${d.category}] ${d.name}: ${d.description}`).join('\n');

    const prompt = `
    Analyze the relationships between these uploaded knowledge base files for Koenig (IT Training Company):
    ${docList}
    
    Task:
    1. Identify how the "Past Performance" reports correlates with "Course Content".
    2. Identify if "Competitor Info" contradicts or supports our "Strategy Briefs".
    3. Provide actionable insights for the Ad Generation team.

    Output Format:
    Provide a "Knowledge Graph" summary in plain text. Use bullet points. 
    `;

    try {
        // Using Gemini 3 Pro for deeper reasoning as requested with MAX Thinking Budget
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text || "Could not analyze relationships.";
    } catch (e) {
        console.error("Correlation error", e);
        return "Error analyzing document relationships.";
    }
}

// --- Smart Audit ---

export const performAccountAudit = async (accountData: any = {}): Promise<AuditIssue[]> => {
    const prompt = `
    You are an AI Auditor for a large Google Ads account (IT Training sector).
    Analyze the following raw account data fetched from the API:
    ${JSON.stringify(accountData)}

    Task:
    Generate 4-5 realistic, high-impact audit findings based on these metrics.
    If data is missing, infer typical issues for this industry.
    
    Categories: BUDGET, KEYWORDS, AD_COPY, SETTINGS.
    Severities: CRITICAL, WARNING, INFO.

    Return JSON.
    `;

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["CRITICAL", "WARNING", "INFO"] },
                category: { type: Type.STRING, enum: ["BUDGET", "KEYWORDS", "AD_COPY", "SETTINGS"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING },
                aiRecommendation: { type: Type.STRING }
            }
        }
    };

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
}

export const analyzeExperimentResults = async (experiment: Experiment): Promise<string> => {
    const prompt = `
    Analyze this A/B Test for Google Ads:
    Experiment Name: ${experiment.name}
    
    Variant A (Control):
    - CTR: ${experiment.variants[0].ctr}%
    - ROAS: ${experiment.variants[0].roas}
    
    Variant B (Test):
    - CTR: ${experiment.variants[1].ctr}%
    - ROAS: ${experiment.variants[1].roas}

    Task:
    1. Determine the winner.
    2. Explain significance.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text || "Analysis failed.";
    } catch (e) {
        return "Could not analyze experiment.";
    }
}