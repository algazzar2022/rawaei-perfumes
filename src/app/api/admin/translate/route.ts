import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function translateText(text: string, from = 'ar', to = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';
  const cleanText = text.trim();

  // 1. Try MyMemory API (Very reliable, generous limits, does not block serverless IP)
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleanText
    )}&langpair=${from}|${to}`;
    const res = await fetch(myMemoryUrl, {
      headers: {
        'User-Agent': 'RawaeiPerfumes/1.0',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        data.responseData &&
        data.responseData.translatedText &&
        data.responseStatus === 200
      ) {
        const result = data.responseData.translatedText.trim();
        // Check it didn't just echo the exact same text or give quota message
        if (
          result &&
          !result.toUpperCase().includes('MYMEMORY WARNING') &&
          result !== cleanText
        ) {
          return result;
        }
        if (result && result !== cleanText) {
          return result;
        }
      }
    }
  } catch (err) {
    console.warn('MyMemory translation failed, falling back to Google:', err);
  }

  // 2. Fallback to Google Translate endpoint
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(
      cleanText
    )}`;
    const res = await fetch(gUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0].map((item: any) => item[0]).join('');
        if (fullTranslation && fullTranslation.trim()) {
          return fullTranslation.trim();
        }
      }
    }
  } catch (err) {
    console.warn('Google translation failed:', err);
  }

  // Return original text if translation failed
  return cleanText;
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
