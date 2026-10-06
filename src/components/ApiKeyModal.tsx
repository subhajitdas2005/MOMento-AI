'use client';

import React, { useState } from 'react';
import { Key, X, Check, Shield, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  customGeminiKey: string;
  customGroqKey: string;
  onSaveKeys: (geminiKey: string, groqKey: string) => void;
}

const ApiKeyModalContent: React.FC<{
  onClose: () => void;
  initialGeminiKey: string;
  initialGroqKey: string;
  onSaveKeys: (geminiKey: string, groqKey: string) => void;
}> = ({
  onClose,
  initialGeminiKey,
  initialGroqKey,
  onSaveKeys,
}) => {
  const [geminiKey, setGeminiKey] = useState(initialGeminiKey);
  const [groqKey, setGroqKey] = useState(initialGroqKey);
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverConfig, setServerConfig] = useState<{
    hasServerGemini: boolean;
    hasServerGroq: boolean;
    hasAnyServerKey: boolean;
  }>({
    hasServerGemini: false,
    hasServerGroq: false,
    hasAnyServerKey: false,
  });

  React.useEffect(() => {
    fetch('/api/config-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasAnyServerKey === 'boolean') {
          setServerConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    onSaveKeys(geminiKey.trim(), groqKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setGeminiKey('');
    setGroqKey('');
    onSaveKeys('', '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-100">API Configuration</h3>
              <p className="text-xs text-zinc-400">Session-only in-memory credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server key active badge if configured */}
        {serverConfig.hasAnyServerKey && (
          <div className="my-3 p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-teal-300">Server Backend Active</p>
              <p className="text-teal-200/80 text-[11px] mt-0.5">
                Default environment keys are configured on the server. Entering custom keys below will override defaults for your current session.
              </p>
            </div>
          </div>
        )}

        {/* Ephemeral Security Notice */}
        <div className="my-3 p-3 rounded-xl bg-zinc-800/60 border border-teal-500/30 text-xs text-zinc-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-teal-300 text-xs">Zero Storage Guarantee</p>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Custom keys are stored <strong>strictly in temporary memory</strong> for this active session. Reloading the page or closing the tab instantly erases your keys completely.
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4 mt-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                Google Gemini API Key
                {serverConfig.hasServerGemini && (
                  <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-600/30 px-1.5 py-0.5 rounded-md font-mono">
                    Server Default
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="text"
                name="session-gemini-token"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                style={{
                  WebkitTextSecurity: showGemini ? 'none' : 'disc',
                } as React.CSSProperties}
                placeholder={serverConfig.hasServerGemini ? "Optional custom override (e.g. AIzaSy...)" : "Enter Gemini API Key (e.g. AIzaSy...)"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                title={showGemini ? "Hide Key" : "Show Key"}
                tabIndex={-1}
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                Groq Whisper API Key
                {serverConfig.hasServerGroq && (
                  <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-600/30 px-1.5 py-0.5 rounded-md font-mono">
                    Server Default
                  </span>
                )}
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-zinc-200 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Get Groq Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="text"
                name="session-groq-token"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                style={{
                  WebkitTextSecurity: showGroq ? 'none' : 'disc',
                } as React.CSSProperties}
                placeholder={serverConfig.hasServerGroq ? "Optional custom override (e.g. gsk_...)" : "Enter Groq API Key (e.g. gsk_...)"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                title={showGroq ? "Hide Key" : "Show Key"}
                tabIndex={-1}
              >
                {showGroq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer"
          >
            Clear Session Key
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Applied!
                </>
              ) : (
                'Apply for Session'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  customGeminiKey,
  customGroqKey,
  onSaveKeys,
}) => {
  if (!isOpen) return null;
  return (
    <ApiKeyModalContent
      onClose={onClose}
      initialGeminiKey={customGeminiKey}
      initialGroqKey={customGroqKey}
      onSaveKeys={onSaveKeys}
    />
  );
};
