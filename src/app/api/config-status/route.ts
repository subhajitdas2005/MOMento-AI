import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);

  return NextResponse.json({
    hasServerGemini: hasGemini,
    hasServerGroq: hasGroq,
    hasAnyServerKey: hasGemini || hasGroq,
  });
}
