'use client';

import React from 'react';
import { Sparkles, Mic, FileText, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { GenerationProgress } from '@/types/mom';

interface ProcessingStateProps {
  progress: GenerationProgress;
  onCancel?: () => void;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ progress, onCancel }) => {
  const steps = [
    {
      id: 'uploading',
      title: '1. Streaming Audio',
      desc: 'Transferring audio to serverless speech engine buffer',
      icon: Mic,
    },
    {
      id: 'transcribing',
      title: '2. Speech-to-Text Recognition',
      desc: 'Transcribing spoken dialog verbatim with speaker separation',
      icon: FileText,
    },
    {
      id: 'analyzing',
      title: '3. Gemini AI Analysis',
      desc: 'Extracting executive summary, decisions, action items & deadlines',
      icon: Cpu,
    },
    {
      id: 'completed',
      title: '4. Structuring MoM Document',
      desc: 'Formatting structured JSON and rendering editable dashboard',
      icon: Sparkles,
    },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ['uploading', 'transcribing', 'analyzing', 'completed'];
    const currentIndex = order.indexOf(progress.stage);
    const stepIndex = order.indexOf(stepId);

    if (progress.stage === 'error') return 'error';
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-xl mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Central Glowing Radar / Spinner */}
      <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-xl animate-pulse" />
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/10">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-zinc-100 mb-1">
        Synthesizing Minutes of Meeting
      </h3>
      <p className="text-xs text-zinc-400 mb-4">
        {progress.message || 'Processing audio with speech recognition and Google Gemini...'}
      </p>

      {/* Progress Bar (Visible during active stages with percent) */}
      {typeof progress.percent === 'number' && (
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
            <span>Progress</span>
            <span className="text-teal-400 font-mono font-semibold">{progress.percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps Pipeline */}
      <div className="space-y-3.5 text-left">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3.5 ${
                status === 'active'
                  ? 'bg-teal-950/40 border-teal-500/50 text-zinc-100 ring-1 ring-teal-500/30'
                  : status === 'completed'
                  ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                  : 'bg-zinc-950/20 border-zinc-900 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    status === 'active'
                      ? 'bg-teal-500/20 text-teal-400'
                      : status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{step.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{step.desc}</p>
                </div>
              </div>

              <div className="shrink-0">
                {status === 'active' && (
                  <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                )}
                {status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {status === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-zinc-800 block" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onCancel && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
          >
            Cancel Processing
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
        <span>🔒 Zero Persistence Guarantee</span>
        <span>•</span>
        <span>Temporary stream auto-discards on finish</span>
      </div>
    </div>
  );
};
