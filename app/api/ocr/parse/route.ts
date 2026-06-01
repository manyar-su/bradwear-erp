import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { BRADFLOW_OCR_PROMPT, normalizeBradflowOcrResult } from '@/lib/ocr/bradflow';

type OcrPayload = {
  imageBase64?: string;
};

function extractRawContent(apiResponse: unknown) {
  if (!apiResponse || typeof apiResponse !== 'object') return '{}';
  const obj = apiResponse as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return obj.choices?.[0]?.message?.content || '{}';
}

export async function POST(request: Request) {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: OcrPayload;
  try {
    payload = (await request.json()) as OcrPayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const imageBase64 = (payload.imageBase64 || '').trim();
  if (!imageBase64) {
    return NextResponse.json({ error: 'imageBase64 wajib diisi.' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_KEY || process.env.VITE_OPENROUTER_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OCR API key belum diset (OPENROUTER_KEY).' },
      { status: 503 }
    );
  }

  const response = await fetch('https://ai.sumopod.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemini/gemini-2.0-flash',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: BRADFLOW_OCR_PROMPT },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const rawApiData = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: (rawApiData as { error?: { message?: string } })?.error?.message || 'OCR request gagal.' },
      { status: response.status }
    );
  }

  let rawResult: Record<string, unknown> = {};
  try {
    const rawContent = extractRawContent(rawApiData);
    rawResult = JSON.parse(rawContent) as Record<string, unknown>;
  } catch {
    rawResult = {};
  }

  const normalized = normalizeBradflowOcrResult(rawResult);

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('ocr_logs').insert([
      {
        source: 'bradflow-clone',
        requested_by_email: user.email,
        raw_result: rawResult,
        normalized_result: normalized,
        image_preview: imageBase64.slice(0, 120),
      },
    ] as unknown as never[]);
  } catch {
    // Logging errors are non-blocking.
  }

  return NextResponse.json({
    ok: true,
    normalized,
    raw: rawResult,
  });
}
