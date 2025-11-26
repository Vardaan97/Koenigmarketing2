import React, { useState } from 'react';
import { Save, Upload, Key, CheckCircle, Database, Server, RefreshCw } from 'lucide-react';
import { configService } from '../services/configService';
import { ApiConfig } from '../types';
import { NeonService } from '../services/neonService';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<ApiConfig>(configService.getConfig() || {});
  const [status, setStatus] = useState<'IDLE' | 'SAVED' | 'ERROR'>('IDLE');
  const [testingNeon, setTestingNeon] = useState(false);
  const [neonStatus, setNeonStatus] = useState<'NONE' | 'SUCCESS' | 'FAILED'>('NONE');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setConfig(json);
        setStatus('IDLE');
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const saveConfig = () => {
    configService.saveConfig(config);
    setStatus('SAVED');
    setTimeout(() => setStatus('IDLE'), 3000);
    
    // Trigger reload of DB service
    if (config.neon?.connectionString) {
        window.location.reload(); 
    }
  };

  const testNeonConnection = async () => {
      if (!config.neon?.connectionString) return;
      setTestingNeon(true);
      const service = new NeonService(config.neon.connectionString);
      const result = await service.init();
      setNeonStatus(result ? 'SUCCESS' : 'FAILED');
      setTestingNeon(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Backend Configuration</h1>
        <p className="text-slate-500 mt-1">Manage API credentials and database connections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Config Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-500" />
                Upload Credentials
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                Upload a <code>credentials.json</code> file containing your Google Ads, Semrush, and Neon DB keys.
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                <input type="file" id="config-upload" className="hidden" accept=".json" onChange={handleFileUpload} />
                <label htmlFor="config-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Key size={32} className="opacity-50" />
                    <span className="font-medium text-slate-700">Drop credentials.json here</span>
                </label>
            </div>
            {config.googleAds && (
                 <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                     <CheckCircle size={16} /> Config Loaded for Google Ads
                 </div>
            )}
        </div>

        {/* Manual Config Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Database size={20} className="text-purple-500" />
                Connection Details
            </h3>
            
            <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Neon DB Connection String</label>
                    <div className="flex gap-2">
                        <input 
                            type="password"
                            className="w-full text-sm border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                            value={config.neon?.connectionString || ''}
                            onChange={(e) => setConfig({ ...config, neon: { ...config.neon!, connectionString: e.target.value } })}
                            placeholder="postgres://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require"
                        />
                        <button 
                            onClick={testNeonConnection}
                            disabled={!config.neon?.connectionString || testingNeon}
                            className="bg-purple-100 text-purple-700 px-3 rounded-lg hover:bg-purple-200"
                            title="Test Connection"
                        >
                            {testingNeon ? <RefreshCw className="animate-spin" size={18} /> : <Server size={18} />}
                        </button>
                    </div>
                    {neonStatus === 'SUCCESS' && <p className="text-xs text-emerald-600 mt-1">✓ Connected successfully. Schema initialized.</p>}
                    {neonStatus === 'FAILED' && <p className="text-xs text-red-500 mt-1">✗ Connection failed. Check credentials.</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Google Ads Customer ID</label>
                    <input 
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                        value={config.googleAds?.customerId || ''}
                        onChange={(e) => setConfig({ ...config, googleAds: { ...config.googleAds!, customerId: e.target.value } })}
                        placeholder="123-456-7890"
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semrush API Key</label>
                    <input 
                        type="password"
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                        value={config.semrush?.apiKey || ''}
                        onChange={(e) => setConfig({ ...config, semrush: { ...config.semrush!, apiKey: e.target.value } })}
                        placeholder="Key..."
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={saveConfig}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                    <Save size={18} />
                    {status === 'SAVED' ? 'Saved & Reloading...' : 'Save Configuration'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;