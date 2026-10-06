'use client';

import React from 'react';
import { Zap, X, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { PRESET_MEETINGS, PresetMeeting } from '@/data/presets';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetMeeting) => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-100">Sample Meeting Transcripts</h3>
              <p className="text-xs text-zinc-400">Select a realistic industry meeting preset to test instant MoM compilation</p>
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

        {/* List */}
        <div className="overflow-y-auto space-y-3.5 py-4 pr-1 my-2">
          {PRESET_MEETINGS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-teal-500/50 hover:bg-zinc-800/40 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-zinc-800 text-teal-400 border border-zinc-700">
                    {preset.badge}
                  </span>
                  <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-teal-300 transition-colors truncate">
                    {preset.name}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {preset.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {preset.metadata.startTime} - {preset.metadata.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {preset.metadata.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-zinc-400" />
                    {preset.metadata.attendees?.length || 0} attendees
                  </span>
                </div>
              </div>

              <div className="sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 group-hover:bg-teal-500 group-hover:text-zinc-950 text-xs font-semibold transition-all">
                  Load & Run <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
