import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Maximum execution duration for long audio processing (Next.js / Vercel)
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const GEMINI_AUDIO_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
];

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  let uploadedGoogleFileName: string | null = null;
  let fileManager: GoogleAIFileManager | null = null;

  try {
    const rawGeminiKey = req.headers.get('x-gemini-key');
    const rawGroqKey = req.headers.get('x-groq-key');
    const geminiKey = (rawGeminiKey || process.env.GEMINI_API_KEY || '').trim();
    const groqKey = (rawGroqKey || process.env.GROQ_API_KEY || '').trim();

    // Check content type
    const contentType = req.headers.get('content-type') || '';
    let audioBuffer: Buffer;
    let mimeType = 'audio/mp3';
    let fileName = 'audio.mp3';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No audio file provided in form data' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type || 'audio/mp3';
      fileName = file.name || 'audio.mp3';
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.audioBase64) {
        return NextResponse.json({ error: 'No audioBase64 provided in request body' }, { status: 400 });
      }
      const base64Data = body.audioBase64.replace(/^data:[^;]+;base64,/, '');
      audioBuffer = Buffer.from(base64Data, 'base64');
      mimeType = body.mimeType || 'audio/mp3';
      fileName = body.fileName || 'audio.mp3';
    } else {
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'Empty audio buffer received' }, { status: 400 });
    }

    const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`[Transcribe] Audio received: ${fileName}, Size: ${fileSizeMB} MB, Type: ${mimeType}`);

    // Determine extension
    let safeExt = path.extname(fileName).toLowerCase();
    if (!safeExt || safeExt === '.') safeExt = '.mp3';
    const cleanBase = path.basename(fileName, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `${cleanBase}_${Date.now()}${safeExt}`;

    // Write buffer to local temp file on disk for direct native stream reading
    tempFilePath = path.join(os.tmpdir(), safeFileName);
    await fs.promises.writeFile(tempFilePath, audioBuffer);
    console.log(`[Transcribe] Saved temp file: ${tempFilePath}`);

    let lastGroqError = '';

    // Step 1: Attempt Groq Whisper using direct Node FileStream (Super fast & reliable on Node 24)
    if (groqKey) {
      if (audioBuffer.length > 25 * 1024 * 1024) {
        console.warn(`[Transcribe] Audio (${fileSizeMB}MB) exceeds Groq 25MB limit. Falling back to Gemini...`);
        lastGroqError = `File (${fileSizeMB} MB) exceeds Groq's 25 MB limit.`;
      } else {
        try {
          console.log(`[Transcribe] Sending audio stream to Groq Whisper API...`);
          const groq = new Groq({ apiKey: groqKey, timeout: 90000 });

          let transcriptText = '';
          try {
            const res = await groq.audio.transcriptions.create({
              file: fs.createReadStream(tempFilePath),
              model: 'whisper-large-v3-turbo',
              response_format: 'json',
              temperature: 0,
            });
            transcriptText = (res.text || '').trim();
          } catch (turboErr: unknown) {
            const err = turboErr as { status?: number; message?: string };
            console.warn('[Transcribe] Groq turbo model error:', err.message);

            // Handle invalid key immediately
            if (err?.status === 401 || err?.message?.includes('Invalid API Key') || err?.message?.includes('invalid_api_key')) {
              return NextResponse.json(
                {
                  error: 'Invalid Groq API Key. Please verify your Groq key in Settings (top right).',
                  needsApiKey: true,
                },
                { status: 401 }
              );
            }

            // Retry with whisper-large-v3
            console.log('[Transcribe] Retrying with Groq whisper-large-v3 model...');
            const res2 = await groq.audio.transcriptions.create({
              file: fs.createReadStream(tempFilePath),
              model: 'whisper-large-v3',
              response_format: 'json',
              temperature: 0,
            });
            transcriptText = (res2.text || '').trim();
          }

          if (transcriptText.length > 0) {
            console.log(`[Transcribe] Groq Whisper completed successfully! Word count: ${transcriptText.split(/\s+/).length}`);
            return NextResponse.json({
              transcript: transcriptText,
              wordCount: transcriptText.split(/\s+/).filter(Boolean).length,
              detectedLanguage: 'en',
              provider: 'groq-whisper',
            });
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[Transcribe] Groq transcription failed:', msg);
          lastGroqError = `Groq transcription error: ${msg}`;
        }
      }
    }

    // Step 2: Use Google Gemini File API as primary/fallback
    if (!geminiKey) {
      const errorDetail = lastGroqError
        ? `${lastGroqError}. Also, no Google Gemini API Key was found as fallback. Please check your keys in Settings.`
        : 'No API Key configured. Please enter your Google Gemini API key or Groq API key in Settings (top right).';
      return NextResponse.json(
        {
          error: errorDetail,
          needsApiKey: true,
        },
        { status: 401 }
      );
    }

    // Normalize audio mime type for Gemini
    let normalizedMimeType = mimeType;
    if (mimeType.includes('webm')) normalizedMimeType = 'audio/webm';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) normalizedMimeType = 'audio/mp3';
    else if (mimeType.includes('wav')) normalizedMimeType = 'audio/wav';
    else if (mimeType.includes('ogg')) normalizedMimeType = 'audio/ogg';
    else if (mimeType.includes('m4a') || mimeType.includes('mp4') || mimeType.includes('aac'))
      normalizedMimeType = 'audio/mp4';

    const prompt = `You are an elite speech-to-text audio transcription engine.
Transcribe the audio recording accurately into clean, verbatim, properly punctuated text.
Rules:
- Transcribe every spoken utterance and conversation thoroughly.
- Distinguish and label distinct speakers if possible (e.g. Speaker 1:, Speaker 2: or Person Name:).
- Do not summarize, skip, or editorialize. Provide the full transcribed dialogue.`;

    const genAI = new GoogleGenerativeAI(geminiKey);

    // If file is larger than 3MB, use Google AI File Manager (handles up to 2GB)
    if (audioBuffer.length > 3 * 1024 * 1024) {
      console.log('[Transcribe] Using GoogleAIFileManager for high-capacity transfer...');
      fileManager = new GoogleAIFileManager(geminiKey);

      console.log(`[Transcribe] Uploading to Google AI Files API: ${tempFilePath}`);
      const uploadResult = await fileManager.uploadFile(tempFilePath, {
        mimeType: normalizedMimeType,
        displayName: safeFileName,
      });

      uploadedGoogleFileName = uploadResult.file.name;
      console.log(`[Transcribe] Uploaded to Google AI File API: ${uploadedGoogleFileName}, state: ${uploadResult.file.state}`);

      // Wait until file is in ACTIVE state
      let currentFile = await fileManager.getFile(uploadResult.file.name);
      let pollCount = 0;
      while (currentFile.state === 'PROCESSING' && pollCount < 25) {
        console.log(`[Transcribe] Waiting for Google File to become ACTIVE (poll ${pollCount + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        currentFile = await fileManager.getFile(uploadResult.file.name);
        pollCount++;
      }

      if (currentFile.state === 'FAILED') {
        throw new Error('Google AI File API failed to process the uploaded audio file.');
      }

      let transcriptText = '';
      let lastGenError: Error | null = null;

      for (const modelName of GEMINI_AUDIO_MODELS) {
        try {
          console.log(`[Transcribe] Trying Gemini model ${modelName} for audio...`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: 0.2 },
          });

          const result = await model.generateContent([
            prompt,
            {
              fileData: {
                fileUri: currentFile.uri,
                mimeType: currentFile.mimeType,
              },
            },
          ]);

          transcriptText = result.response.text().trim();
          console.log(`[Transcribe] Gemini transcription completed via ${modelName}! Length: ${transcriptText.length}`);
          break;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.warn(`[Transcribe] Model ${modelName} failed:`, error.message);
          lastGenError = error;
        }
      }

      if (!transcriptText) {
        throw lastGenError || new Error('All Gemini transcription models failed.');
      }

      return NextResponse.json({
        transcript: transcriptText,
        wordCount: transcriptText.split(/\s+/).filter(Boolean).length,
        provider: 'gemini-files-api',
      });
    } else {
      // For small files under 3MB, inline base64
      console.log('[Transcribe] Audio size <= 3MB. Using inline base64...');
      const audioBase64 = audioBuffer.toString('base64');
      let transcriptText = '';
      let lastGenError: Error | null = null;

      for (const modelName of GEMINI_AUDIO_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: 0.2 },
          });

          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                mimeType: normalizedMimeType,
                data: audioBase64,
              },
            },
          ]);

          transcriptText = result.response.text().trim();
          console.log(`[Transcribe] Inline transcription completed via ${modelName}! Length: ${transcriptText.length}`);
          break;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.warn(`[Transcribe] Inline model ${modelName} failed:`, error.message);
          lastGenError = error;
        }
      }

      if (!transcriptText) {
        throw lastGenError || new Error('All Gemini inline models failed.');
      }

      return NextResponse.json({
        transcript: transcriptText,
        wordCount: transcriptText.split(/\s+/).filter(Boolean).length,
        provider: 'gemini-inline-stt',
      });
    }
  } catch (error: unknown) {
    console.error('[Transcribe] Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Unknown transcription error';
    return NextResponse.json(
      { error: `Transcription failed: ${message}` },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary local file
    if (tempFilePath) {
      try {
        if (fs.existsSync(tempFilePath)) {
          await fs.promises.unlink(tempFilePath);
          console.log(`[Transcribe] Cleaned up temp file: ${tempFilePath}`);
        }
      } catch (err) {
        console.warn('[Transcribe] Failed to delete local temp file:', err);
      }
    }

    // Cleanup Google AI File storage
    if (fileManager && uploadedGoogleFileName) {
      try {
        await fileManager.deleteFile(uploadedGoogleFileName);
        console.log(`[Transcribe] Deleted temporary Google AI file: ${uploadedGoogleFileName}`);
      } catch (err) {
        console.warn('[Transcribe] Failed to delete temporary Google AI file:', err);
      }
    }
  }
}
