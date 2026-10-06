'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, Sparkles, AlertCircle, Volume2, FileAudio } from 'lucide-react';

interface LiveRecorderProps {
  onFinishRecording: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export const LiveRecorder: React.FC<LiveRecorderProps> = ({ onFinishRecording, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopRecordingCleanup = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, stopRecordingCleanup]);

  // Audio Visualizer Animation Loop
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 40) * 1.5;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        const value = dataArray[i * 2] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.85);

        const y = (canvas.height - barHeight) / 2;

        // Gradient for bars (Teal to Cyan)
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#14B8A6');
        gradient.addColorStop(1, '#0D9488');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 3, barHeight, 3);
        ctx.fill();

        x += barWidth;
      }
    };

    render();
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        'Live microphone access is blocked by mobile browsers over insecure HTTP (e.g. 192.168.x.x). To record live, use HTTPS (or localhost), or use the "Upload Recording" tab to pick audio/voice memos.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Setup Web Audio Analyser
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Start Visualizer
      drawVisualizer();

      // Determine supported mime type
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, selectedMimeType ? { mimeType: selectedMimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const completeBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType || 'audio/webm',
        });
        setAudioBlob(completeBlob);
        const url = URL.createObjectURL(completeBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start(500); // 500ms chunks
      setIsRecording(true);
      setIsPaused(false);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Error accessing microphone:', err);
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setErrorMessage(`Microphone access error: ${msg}. Please allow microphone permissions in browser.`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerIntervalRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
    }
  };

  const endMeeting = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopRecordingCleanup();
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (!playbackAudioRef.current) return;
    if (isPlayingRecorded) {
      playbackAudioRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      playbackAudioRef.current.play();
      setIsPlayingRecorded(true);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">3. Live Meeting Voice Capture</h2>
            <p className="text-xs text-zinc-400">Record spoken meeting audio directly through browser microphone</p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {isPaused ? 'PAUSED' : 'LIVE RECORDING'}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Recording Surface */}
      {!audioBlob ? (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl">
          {/* Waveform Canvas */}
          <div className="w-full max-w-md h-24 mb-6 flex items-center justify-center bg-zinc-900/80 rounded-xl border border-zinc-800/60 px-4 overflow-hidden">
            {isRecording ? (
              <canvas ref={canvasRef} width={380} height={80} className="w-full h-full" />
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Volume2 className="w-4 h-4 text-zinc-600" />
                <span>Microphone inactive. Click Start Meeting to begin.</span>
              </div>
            )}
          </div>

          {/* Time Counter */}
          <div className="font-mono text-3xl font-bold tracking-wider text-zinc-100 mb-6">
            {formatTimer(duration)}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Mic className="w-4 h-4" /> Start Meeting Recording
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>

                <button
                  type="button"
                  onClick={endMeeting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> End Meeting
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Recorded Preview State */
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">Live Recording Completed</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Duration: {formatTimer(duration)} • {Math.round(audioBlob.size / 1024)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {audioUrl && (
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  title={isPlayingRecorded ? 'Pause Playback' : 'Play Recorded Audio'}
                >
                  {isPlayingRecorded ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              )}
              <button
                type="button"
                onClick={startRecording}
                disabled={isProcessing}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Re-record"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {audioUrl && (
            <audio
              ref={playbackAudioRef}
              src={audioUrl}
              onEnded={() => setIsPlayingRecorded(false)}
              className="hidden"
            />
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onFinishRecording(audioBlob)}
            className="w-full py-3.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Transcribe & Generate Minutes of Meeting
          </button>
        </div>
      )}
    </div>
  );
};
