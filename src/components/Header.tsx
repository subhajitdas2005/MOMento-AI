'use client';

import React from 'react';
import { Key, RotateCcw, Zap } from 'lucide-react';

import { MomentoLogo } from '@/components/MomentoLogo';

interface HeaderProps {
  onOpenSettings: () => void;
  hasCustomKey: boolean;
  hasServerKey?: boolean;
  onReset: () => void;
  hasActiveMoM: boolean;
  onOpenPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  hasCustomKey,
  hasServerKey = false,
  onReset,
  hasActiveMoM,
  onOpenPresets,
}) => {
  const isKeyActive = hasCustomKey || hasServerKey;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <MomentoLogo size="md" />

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Presets Button */}
          <button
            onClick={onOpenPresets}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:text-teal-300 transition-all cursor-pointer shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Sample Presets</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenSettings}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer shadow-sm ${
              isKeyActive
                ? 'bg-teal-950/40 border-teal-500/40 text-teal-300 hover:bg-teal-900/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">
              {hasCustomKey ? 'Custom Key' : hasServerKey ? 'API Ready' : 'Configure Key'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isKeyActive ? 'bg-teal-400 animate-pulse' : 'bg-zinc-600'}`} />
          </button>

          {/* Reset / New Session */}
          {hasActiveMoM && (
            <button
              onClick={onReset}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Meeting</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
