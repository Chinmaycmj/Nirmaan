'use client';

import React, { useState } from 'react';
import { AISettings, AIProviderType } from '@/types/ai';
import { X, Settings, Key, Cpu, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
  onResetProject: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetProject,
}) => {
  const [provider, setProvider] = useState<AIProviderType>(settings.provider);
  const [apiKey, setApiKey] = useState<string>(settings.apiKey || '');
  const [model, setModel] = useState<string>(settings.model || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Platform Settings & AI Configuration</h2>
              <span className="text-[11px] text-slate-400">Configure AI Providers and Project State</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Provider Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Provider Mode:</span>
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProviderType)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="builtin">Built-in Intelligent Tutor Engine (Works 100% Offline, Zero Setup)</option>
              <option value="gemini">Google Gemini API (Custom Key)</option>
              <option value="openai">OpenAI GPT-4o (Custom Key)</option>
              <option value="anthropic">Anthropic Claude (Custom Key)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              The Built-in engine includes fully functional AST curricula and instant automated evaluations without needing an external API key.
            </p>
          </div>

          {/* API Key Input (if external provider selected) */}
          {provider !== 'builtin' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Key:</span>
              </label>
              <input
                type="password"
                placeholder={`Enter your ${provider.toUpperCase()} API key...`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Your key is stored only locally in your browser memory and never uploaded to public servers.</span>
              </p>
            </div>
          )}

          {/* Reset Project Option */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="font-semibold text-rose-400">Danger Zone:</span>
            <div className="flex items-center justify-between bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
              <div>
                <p className="font-medium text-slate-300">Reset Project to Initial State</p>
                <p className="text-[11px] text-slate-500">Clear custom checkpoint progress and restore base template.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset this project?')) {
                    onResetProject();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
