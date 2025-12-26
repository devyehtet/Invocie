
import React, { useState, useEffect } from 'react';
import { analyzeFinances } from '../services/geminiService';
import { Invoice } from '../types';

interface GeminiAssistantProps {
  invoices: Invoice[];
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ invoices }) => {
  const [insights, setInsights] = useState<{ insight: string, action: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await analyzeFinances(invoices);
    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && insights.length === 0) {
      fetchInsights();
    }
  }, [isOpen]);

  return (
    <div className={`fixed right-6 bottom-6 z-20 no-print transition-all duration-300 ${isOpen ? 'w-80' : 'w-16'}`}>
      {isOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="font-bold">AI Financial Guide</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-purple-500 rounded p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-medium">Analyzing your billing history...</p>
              </div>
            ) : (
              insights.map((item, idx) => (
                <div key={idx} className="bg-purple-50 border border-purple-100 p-4 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Insight</p>
                  <p className="text-sm text-slate-700">{item.insight}</p>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Recommendation</p>
                    <p className="text-xs text-slate-600 italic">"{item.action}"</p>
                  </div>
                </div>
              ))
            )}
            {!loading && insights.length === 0 && (
              <button 
                onClick={fetchInsights}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all text-sm font-medium"
              >
                Generate insights now
              </button>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-400 text-center">Powered by Gemini 3 Flash</p>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-200 hover:scale-110 transition-transform"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
