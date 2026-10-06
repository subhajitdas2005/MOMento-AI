'use client';

import React from 'react';
import { UploadCloud, Mic, Zap, CheckCircle2 } from 'lucide-react';

export type InputMode = 'upload' | 'live' | 'preset';

interface ModeSelectorProps {
  activeMode: InputMode;
  onSelectMode: (mode: InputMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onSelectMode }) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/60">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">2. Choose Meeting Audio Source</h2>
          <p className="text-xs text-zinc-400">Select how you would like to provide the meeting audio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Upload Mode Card */}
        <button
          type="button"
          onClick={() => onSelectMode('upload')}
          className={`relative p-5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
            activeMode === 'upload'
              ? 'bg-teal-950/30 border-teal-500/60 ring-1 ring-teal-500/40 shadow-lg shadow-teal-500/5'
              : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
          }`}
        >
          {activeMode === 'upload' && (
            <div className="absolute top-3.5 right-3.5 text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div className="p-3 w-fit rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Upload Recording</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload an existing MP3, WAV, M4A, or MP4 recording file.
            </p>
          </div>
        </button>

        {/* Live Meeting Card */}
        <button
          type="button"
          onClick={() => onSelectMode('live')}
          className={`relative p-5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
            activeMode === 'live'
              ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg shadow-rose-500/5'
              : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
          }`}
        >
          {activeMode === 'live' && (
            <div className="absolute top-3.5 right-3.5 text-rose-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div className="p-3 w-fit rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Live Meeting</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Record microphone audio live in browser with real-time waveform visualizer.
            </p>
          </div>
        </button>

        {/* Instant Presets Card */}
        <button
          type="button"
          onClick={() => onSelectMode('preset')}
          className={`relative p-5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
            activeMode === 'preset'
              ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/5'
              : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
          }`}
        >
          {activeMode === 'preset' && (
            <div className="absolute top-3.5 right-3.5 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div className="p-3 w-fit rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Sample Preset</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Load realistic industry meeting transcripts to test AI synthesis instantly.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
