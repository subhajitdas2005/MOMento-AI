'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Header } from '@/components/Header';
import { MeetingSetupForm } from '@/components/MeetingSetupForm';
import { ModeSelector, InputMode } from '@/components/ModeSelector';
import { AudioUploader } from '@/components/AudioUploader';
import { LiveRecorder } from '@/components/LiveRecorder';
import { ProcessingState } from '@/components/ProcessingState';
import { MoMDashboard } from '@/components/MoMDashboard';
import { ExportActions } from '@/components/ExportActions';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { PresetSelectorModal } from '@/components/PresetSelectorModal';
import { Toast } from '@/components/Toast';
import { MeetingMetadata, MoMData, GenerationProgress } from '@/types/mom';
import { PresetMeeting } from '@/data/presets';
import { AlertCircle, Sparkles, Shield } from 'lucide-react';

const emptySubscribe = () => () => {};

export default function Home() {
  // Meeting metadata state
  const [metadata, setMetadata] = useState<MeetingMetadata>({
    title: 'Product & Architecture Sprint Sync',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    venue: 'Google Meet',
    attendees: ['Alex Chen', 'Sarah Miller', 'David Ross'],
  });

  const [activeMode, setActiveMode] = useState<InputMode>('upload');
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'idle',
    message: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMoM, setActiveMoM] = useState<MoMData | null>(null);

  // Client mounting store
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasServerKey, setHasServerKey] = useState(false);

  useEffect(() => {
    fetch('/api/config-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasAnyServerKey === 'boolean') {
          setHasServerKey(data.hasAnyServerKey);
        }
      })
      .catch(() => {});
  }, []);

  // Session-only in-memory API keys (vanish on page reload/refresh)
  const [customGeminiKey, setCustomGeminiKey] = useState<string>('');
  const [customGroqKey, setCustomGroqKey] = useState<string>('');

  // Proactively wipe any legacy keys from localStorage so nothing persists across visits/reloads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('groq_api_key');
      } catch {}
    }
  }, []);

  const hasCustomKey = Boolean(customGeminiKey.trim() || customGroqKey.trim());

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Helper to fetch custom headers (purely in-memory, vanishes on reload)
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (customGeminiKey.trim()) headers['x-gemini-key'] = customGeminiKey.trim();
    if (customGroqKey.trim()) headers['x-groq-key'] = customGroqKey.trim();
    return headers;
  };

  // 1. Process Audio File Pipeline (Upload or Recorded)
  const processAudioPipeline = async (audioBlob: Blob, filename = 'recording.webm') => {
    setErrorMessage(null);
    let transcriptionTimer: NodeJS.Timeout | null = null;

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      const headers = getAuthHeaders();

      // Step 1: Uploading with real live progress tracking
      setProgress({
        stage: 'uploading',
        percent: 0,
        message: 'Preparing audio stream...',
      });

      const transcribeData = await new Promise<{ transcript: string; error?: string; needsApiKey?: boolean }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/transcribe');

        // Set custom auth headers
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            const loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
            const totalMB = (e.total / (1024 * 1024)).toFixed(1);
            setProgress({
              stage: 'uploading',
              percent,
              message: `Uploading audio: ${loadedMB} MB / ${totalMB} MB (${percent}%)...`,
            });
          }
        };

        xhr.upload.onload = () => {
          // When 100% uploaded to server, switch to AI speech recognition
          setProgress({
            stage: 'transcribing',
            percent: undefined,
            message: 'Audio received by server! Running AI speech recognition...',
          });

          // Progressive feedback during audio inference
          let elapsed = 0;
          transcriptionTimer = setInterval(() => {
            elapsed += 4;
            if (elapsed >= 6 && elapsed < 16) {
              setProgress((prev) =>
                prev.stage === 'transcribing'
                  ? { ...prev, message: 'AI model actively transcribing spoken dialog...' }
                  : prev
              );
            } else if (elapsed >= 16) {
              setProgress((prev) =>
                prev.stage === 'transcribing'
                  ? { ...prev, message: 'Finalizing full transcript extraction...' }
                  : prev
              );
            }
          }, 4000);
        };

        xhr.onload = () => {
          if (transcriptionTimer) clearInterval(transcriptionTimer);
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(json);
            } else {
              if (json.needsApiKey) {
                setIsSettingsOpen(true);
              }
              reject(new Error(json.error || `Transcription failed with status ${xhr.status}`));
            }
          } catch {
            reject(new Error(xhr.responseText || `Server responded with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          if (transcriptionTimer) clearInterval(transcriptionTimer);
          reject(new Error('Network error occurred while communicating with the server.'));
        };

        xhr.ontimeout = () => {
          if (transcriptionTimer) clearInterval(transcriptionTimer);
          reject(new Error('Audio processing request timed out. Please try again.'));
        };

        xhr.timeout = 240000; // 4 minutes
        xhr.send(formData);
      });

      if (transcriptionTimer) clearInterval(transcriptionTimer);

      const transcriptText = transcribeData.transcript;
      if (!transcriptText) {
        throw new Error('Empty transcript received from speech recognition.');
      }

      // Step 3: AI Analysis & MoM Generation
      setProgress({
        stage: 'analyzing',
        percent: undefined,
        message: 'Synthesizing executive summary, key decisions & action items...',
      });

      const momRes = await fetch('/api/generate-mom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          transcript: transcriptText,
          metadata: metadata,
        }),
      });

      const momData = await momRes.json();

      if (!momRes.ok) {
        if (momData.needsApiKey) {
          setIsSettingsOpen(true);
        }
        throw new Error(momData.error || 'Failed to synthesize Minutes of Meeting.');
      }

      // Step 4: Completed
      setProgress({
        stage: 'completed',
        percent: 100,
        message: 'Minutes of Meeting compiled successfully!',
      });

      setActiveMoM(momData);
      showToast('Minutes of Meeting generated successfully!');
    } catch (err: unknown) {
      if (transcriptionTimer) clearInterval(transcriptionTimer);
      console.error(err);
      const msg = err instanceof Error ? err.message : 'An error occurred during processing.';
      setErrorMessage(msg);
      setProgress({
        stage: 'error',
        message: msg,
      });
    }
  };

  // Handler for File Upload
  const handleProcessUploadedFile = (file: File) => {
    processAudioPipeline(file, file.name);
  };

  // Handler for Live Recorded Blob
  const handleProcessRecordedBlob = (blob: Blob) => {
    processAudioPipeline(blob, `live-meeting-${Date.now()}.webm`);
  };

  // Handler for Sample Presets (Works with live API or fallback pre-compiled demo)
  const handleSelectPreset = async (preset: PresetMeeting) => {
    setErrorMessage(null);
    setMetadata(preset.metadata);

    const headers = getAuthHeaders();
    const hasKey = !!headers['x-gemini-key'];

    setProgress({
      stage: 'analyzing',
      message: `Analyzing "${preset.name}" with Gemini AI...`,
    });

    if (hasKey) {
      try {
        const momRes = await fetch('/api/generate-mom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            transcript: preset.transcript,
            metadata: preset.metadata,
          }),
        });

        const momData = await momRes.json();
        if (!momRes.ok) {
          throw new Error(momData.error || 'API generation failed');
        }

        setProgress({ stage: 'completed', message: 'Minutes of Meeting generated!' });
        setActiveMoM(momData);
        showToast(`Loaded "${preset.name}" via live Gemini AI.`);
        return;
      } catch (err) {
        console.warn('Live API attempt failed, loading preset sample data...', err);
      }
    }

    // Smooth demo simulation fallback
    setTimeout(() => {
      setProgress({
        stage: 'completed',
        message: 'Minutes of Meeting generated!',
      });
      const generatedMoM: MoMData = {
        ...preset.sampleMoM,
        transcript: preset.transcript,
      };
      setActiveMoM(generatedMoM);
      showToast(`Loaded "${preset.name}" demo.`);
    }, 600);
  };

  // Reset session and purge all temporary data
  const handleResetSession = () => {
    setActiveMoM(null);
    setProgress({ stage: 'idle', message: '' });
    setErrorMessage(null);
    showToast('Temporary audio & transcript data purged from session.');
  };

  const isProcessing =
    progress.stage === 'uploading' ||
    progress.stage === 'transcribing' ||
    progress.stage === 'analyzing';

  if (!mounted) {
    return null;
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#090A0F] text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200"
    >
      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={hasCustomKey}
        hasServerKey={hasServerKey}
        onReset={handleResetSession}
        hasActiveMoM={!!activeMoM}
        onOpenPresets={() => setIsPresetsOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-300">Action Required</h4>
                <p className="text-xs text-red-300/80 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-semibold cursor-pointer"
              >
                Set API Key
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1.5 rounded-lg hover:bg-red-900/40 text-red-400 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Processing State View */}
        {isProcessing ? (
          <ProcessingState progress={progress} onCancel={handleResetSession} />
        ) : activeMoM ? (
          /* Generated MoM View with Export Actions */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Sticky/Top Export Bar */}
            <ExportActions
              mom={activeMoM}
              onReset={handleResetSession}
              onShowToast={showToast}
            />

            {/* Interactive MoM Dashboard */}
            <MoMDashboard
              mom={activeMoM}
              onUpdateMoM={(updated) => setActiveMoM(updated)}
              onShowToast={showToast}
            />
          </div>
        ) : (
          /* Meeting Creation & Audio Selection Workflow */
          <div className="space-y-8">
            {/* Hero Intro */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Speech-to-Text + Gemini AI Pipeline
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
                Transform Meeting Audio into <span className="text-teal-400">Actionable Minutes</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Upload recordings or capture live microphone discussions. Automatically extract executive summaries,
                key decisions, and assignee action items with one-click PDF & Word exports.
              </p>
            </div>

            {/* Step 1: Meeting Details */}
            <MeetingSetupForm
              metadata={metadata}
              onChange={(updated) => setMetadata(updated)}
            />

            {/* Step 2: Choose Mode */}
            <ModeSelector
              activeMode={activeMode}
              onSelectMode={(mode) => {
                setActiveMode(mode);
                if (mode === 'preset') {
                  setIsPresetsOpen(true);
                }
              }}
            />

            {/* Step 3: Audio Source Input */}
            {activeMode === 'upload' && (
              <AudioUploader
                onProcessAudio={handleProcessUploadedFile}
                isProcessing={isProcessing}
              />
            )}

            {activeMode === 'live' && (
              <LiveRecorder
                onFinishRecording={handleProcessRecordedBlob}
                isProcessing={isProcessing}
              />
            )}

            {activeMode === 'preset' && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
                <p className="text-xs text-zinc-400">
                  Select from pre-configured engineering, executive, or client kickoff transcripts to generate instant Minutes of Meeting.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPresetsOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Open Sample Presets Modal
                </button>
              </div>
            )}

            {/* Privacy & Zero-Persistence Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  <strong>Strict Privacy:</strong> Audio streams are processed purely in-memory and discarded immediately after transcription. No recordings or transcripts are stored in any database.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} MoMento AI • Privacy-First Meeting Intelligence</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Powered by Next.js, Tailwind CSS & Google Gemini</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal - Session Only */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customGeminiKey={customGeminiKey}
        customGroqKey={customGroqKey}
        onSaveKeys={(gemini, groq) => {
          setCustomGeminiKey(gemini);
          setCustomGroqKey(groq);
          if (gemini || groq) {
            showToast('Session API credentials active (will vanish on reload).');
          } else {
            showToast('API credentials cleared.');
          }
        }}
      />

      {/* Sample Presets Modal */}
      <PresetSelectorModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Global Notification Toast */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
