'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Trash2, Play, Pause, Sparkles, AlertCircle } from 'lucide-react';

interface AudioUploaderProps {
  onProcessAudio: (file: File) => void;
  isProcessing: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onProcessAudio, isProcessing }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['mp3', 'wav', 'm4a', 'aac', 'webm', 'ogg', 'mp4'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(fileExt) && !file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setErrorMessage(`Unsupported format .${fileExt}. Please upload an MP3, WAV, M4A, WEBM, or MP4 file.`);
      return;
    }

    // Limit check (e.g. 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('File size exceeds 100MB. Please use a smaller clip.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-800/60">
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">3. Upload Meeting Recording</h2>
          <p className="text-xs text-zinc-400">Upload recorded audio or video file from your conference</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 group ${
            dragOver
              ? 'border-teal-400 bg-teal-950/20'
              : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-950/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/mp4,video/webm,.mp3,.wav,.m4a,.aac,.webm,.ogg,.mp4"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-teal-400 group-hover:scale-110 group-hover:border-teal-500/30 transition-all shadow-md">
            <FileAudio className="w-8 h-8" />
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Drag & Drop your meeting recording here, or <span className="text-teal-400 underline">browse</span>
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Supports MP3, WAV, M4A, AAC, WEBM, OGG, MP4 (Up to 100MB)
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">In-Memory Streaming</span>
            <span>•</span>
            <span className="text-teal-400 font-medium">Automatic Purge after STT</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-200 truncate">{selectedFile.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'audio/recording'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {audioUrl && (
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause Preview' : 'Play Preview'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              )}
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isProcessing}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-red-950/50 hover:text-red-400 text-zinc-400 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onProcessAudio(selectedFile)}
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
