import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function translateText(text: string, from = 'ar', to = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(
      text.trim()
    )}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((item: any) => item[0]).join('');
    }
    return text;
  } catch (err) {
    console.error('Translate engine error:', err);
    // Fallback: simple transliteration / basic return
    return text;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, texts, sl = 'ar', tl = 'en' } = body;

    // Single text translation
    if (typeof text === 'string') {
      const translated = await translateText(text, sl, tl);
      return NextResponse.json({ success: true, translated });
    }

    // Batch translation of multiple fields (e.g. { name: '...', description: '...' })
    if (texts && typeof texts === 'object') {
      const result: Record<string, string> = {};
      for (const [key, val] of Object.entries(texts)) {
        if (typeof val === 'string' && val.trim()) {
          result[key] = await translateText(val, sl, tl);
        } else {
          result[key] = '';
        }
      }
      return NextResponse.json({ success: true, translated: result });
    }

    return NextResponse.json({ error: 'No text or texts provided' }, { status: 400 });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء الترجمة' },
      { status: 500 }
    );
  }
}
