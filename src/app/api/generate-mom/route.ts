import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { MeetingMetadata, MoMData } from '@/types/mom';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
];

const GROQ_LLM_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
];

const MOM_JSON_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    meeting_title: {
      type: SchemaType.STRING,
      description: 'Clear, executive title of the meeting',
    },
    summary: {
      type: SchemaType.STRING,
      description: 'A comprehensive 3-5 sentence executive summary of the meeting context, major outcomes, and next steps',
    },
    discussion_points: {
      type: SchemaType.ARRAY,
      description: 'Key themes and topics discussed during the meeting with detailed breakdown',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          topic: { type: SchemaType.STRING, description: 'Short theme or topic header' },
          details: { type: SchemaType.STRING, description: 'Detailed bullet points and nuances of what was discussed' },
        },
        required: ['topic', 'details'],
      },
    },
    decisions: {
      type: SchemaType.ARRAY,
      description: 'Explicit decisions, approvals, agreements, and policies agreed upon during the meeting',
      items: { type: SchemaType.STRING },
    },
    action_items: {
      type: SchemaType.ARRAY,
      description: 'Concrete actionable tasks assigned to specific people with deadlines',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          task: { type: SchemaType.STRING, description: 'Specific actionable deliverable' },
          assigned_to: { type: SchemaType.STRING, description: 'Name of the responsible person or team' },
          deadline: { type: SchemaType.STRING, description: 'Target date, time, or relative deadline (e.g., "Thursday 5 PM" or "Oct 15")' },
        },
        required: ['task', 'assigned_to', 'deadline'],
      },
    },
    unresolved_issues: {
      type: SchemaType.ARRAY,
      description: 'Open questions, risks, blockers, or items requiring follow-up outside the meeting',
      items: { type: SchemaType.STRING },
    },
  },
  required: ['meeting_title', 'summary', 'discussion_points', 'decisions', 'action_items', 'unresolved_issues'],
};

const SYSTEM_INSTRUCTION = `You are an elite Executive Chief of Staff and Master Minutes of Meeting (MoM) compiler.
Your task is to convert raw meeting transcripts into pristine, structured, and actionable Minutes of Meeting JSON.
Guidelines:
1. Extract high-signal, objective insights.
2. Group discussion points into logical, distinct topics with actionable clarity.
3. Clearly isolate finalized Decisions from general discussion.
4. Extract Action Items with exact assignees and precise deadlines mentioned. If not stated, mark as "Team" or "TBD".
5. Identify all blockers, risks, and unresolved issues requiring follow-up.
6. Maintain a professional, executive tone.
7. Return ONLY a valid JSON object matching the requested schema.`;

function buildPrompt(transcript: string, metadata?: MeetingMetadata): string {
  return `Generate structured Minutes of Meeting (MoM) JSON from the following meeting transcript.

${metadata ? `MEETING METADATA CONTEXT:
- Title: ${metadata.title || 'Untitled Meeting'}
- Date: ${metadata.date || 'Today'}
- Scheduled Time: ${metadata.startTime || ''} - ${metadata.endTime || ''}
- Venue / Room: ${metadata.venue || 'Virtual'}
- Attendees: ${metadata.attendees && metadata.attendees.length > 0 ? metadata.attendees.join(', ') : 'Not explicitly listed'}
` : ''}

RAW MEETING TRANSCRIPT:
"""
${transcript}
"""`;
}

// Generate with Google Gemini
async function generateWithGemini(apiKey: string, prompt: string): Promise<Partial<MoMData>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[MoM Generate] Trying Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: MOM_JSON_SCHEMA,
          temperature: 0.2,
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log(`[MoM Generate] Successfully generated MoM with ${modelName}!`);
      return JSON.parse(responseText);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn(`[MoM Generate] Model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

// Generate with Groq LLM (High-speed fallback)
async function generateWithGroq(apiKey: string, prompt: string): Promise<Partial<MoMData>> {
  const groq = new Groq({ apiKey });
  let lastError: Error | null = null;

  for (const modelName of GROQ_LLM_MODELS) {
    try {
      console.log(`[MoM Generate] Trying Groq LLM (${modelName})...`);
      const completion = await groq.chat.completions.create({
        model: modelName,
        response_format: { type: 'json_object' },
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_INSTRUCTION}

You MUST return a JSON object with this exact structure:
{
  "meeting_title": "string",
  "summary": "string (3-5 sentences)",
  "discussion_points": [{"topic": "string", "details": "string"}],
  "decisions": ["string"],
  "action_items": [{"task": "string", "assigned_to": "string", "deadline": "string"}],
  "unresolved_issues": ["string"]
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const rawContent = completion.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawContent);
      console.log(`[MoM Generate] Successfully generated MoM with Groq model ${modelName}!`);
      return parsed;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn(`[MoM Generate] Groq model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error('All Groq models failed.');
}

export async function POST(req: NextRequest) {
  try {
    const rawGeminiKey = req.headers.get('x-gemini-key');
    const rawGroqKey = req.headers.get('x-groq-key');
    const geminiKey = (rawGeminiKey || process.env.GEMINI_API_KEY || '').trim();
    const groqKey = (rawGroqKey || process.env.GROQ_API_KEY || '').trim();

    if (!geminiKey && !groqKey) {
      return NextResponse.json(
        {
          error: 'No AI API key found. Please set your Google Gemini API key or Groq API key in Settings (top right).',
          needsApiKey: true,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { transcript, metadata }: { transcript: string; metadata?: MeetingMetadata } = body;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'Transcript is required to generate Minutes of Meeting.' }, { status: 400 });
    }

    const prompt = buildPrompt(transcript, metadata);
    let parsedMom: Partial<MoMData> | null = null;
    let geminiErr: Error | null = null;

    // Strategy 1: Try Gemini first if Gemini key is available
    if (geminiKey) {
      try {
        parsedMom = await generateWithGemini(geminiKey, prompt);
      } catch (err) {
        geminiErr = err instanceof Error ? err : new Error(String(err));
        console.warn('[MoM Generate] Gemini attempt failed, trying Groq if available...', geminiErr.message);
      }
    }

    // Strategy 2: If Gemini failed or no Gemini key, try Groq LLM
    if (!parsedMom && groqKey) {
      try {
        parsedMom = await generateWithGroq(groqKey, prompt);
      } catch (groqErr) {
        console.error('[MoM Generate] Groq LLM attempt also failed:', groqErr);
        if (!geminiKey) {
          throw groqErr;
        }
      }
    }

    if (!parsedMom) {
      throw geminiErr || new Error('Failed to generate structured MoM with available AI models.');
    }

    // Attach UUIDs to action items and normalize
    const actionItemsWithIds = (parsedMom.action_items || []).map((item, idx) => ({
      id: `action-${Date.now()}-${idx}`,
      task: item.task || 'Unspecified task',
      assigned_to: item.assigned_to || 'Unassigned',
      deadline: item.deadline || 'TBD',
      status: 'pending' as const,
    }));

    const completeMoM: MoMData = {
      meeting_title: parsedMom.meeting_title || metadata?.title || 'Minutes of Meeting',
      summary: parsedMom.summary || 'Summary unavailable.',
      discussion_points: parsedMom.discussion_points || [],
      decisions: parsedMom.decisions || [],
      action_items: actionItemsWithIds,
      unresolved_issues: parsedMom.unresolved_issues || [],
      metadata: metadata,
      transcript: transcript,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(completeMoM);
  } catch (error: unknown) {
    console.error('MoM Generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate MoM';
    return NextResponse.json(
      { error: `AI MoM Generation failed: ${message}` },
      { status: 500 }
    );
  }
}
