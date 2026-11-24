/**
 * Utility functions for automatic Arabic to English translation in Admin Dashboard.
 * Employs a dual-layer strategy:
 * 1. Server-side API (/api/admin/translate) powered by MyMemory + Google Translate
 * 2. Client-side fallback directly in browser in case server endpoint experiences timeouts.
 */

async function directBrowserTranslate(text: string, from = 'ar', to = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';
  const clean = text.trim();
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(
      clean
    )}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const tr = data[0].map((item: any) => item[0]).join('');
        if (tr && tr.trim()) return tr.trim();
      }
    }
  } catch (err) {
    console.warn('Browser direct translation fallback failed:', err);
  }
  return '';
}

export async function autoTranslate(text: string, from = 'ar', to = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';
  const clean = text.trim();

  // 1. Try serverless endpoint first
  try {
    const res = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, sl: from, tl: to }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.translated && data.translated !== clean) {
        return data.translated;
      }
    }
  } catch (err) {
    console.warn('Server translate call failed, trying direct browser fallback:', err);
  }

  // 2. Direct browser fallback
  const browserFallback = await directBrowserTranslate(clean, from, to);
  if (browserFallback) {
    return browserFallback;
  }

  return '';
}

export async function autoTranslateBatch(
  texts: Record<string, string>,
  from = 'ar',
  to = 'en'
): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, sl: from, tl: to }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.translated && typeof data.translated === 'object') {
        const out = { ...data.translated };
        // Check if any field failed to translate, fallback for that field
        for (const [k, v] of Object.entries(texts)) {
          if (v && (!out[k] || out[k] === v)) {
            const fb = await directBrowserTranslate(v, from, to);
            if (fb) out[k] = fb;
          }
        }
        return out;
      }
    }
  } catch (err) {
    console.warn('Batch translation server call failed:', err);
  }

  // Fallback individually in parallel
  const fallbackResult: Record<string, string> = {};
  await Promise.all(
    Object.entries(texts).map(async ([key, val]) => {
      if (val && val.trim()) {
        const tr = await directBrowserTranslate(val, from, to);
        fallbackResult[key] = tr || '';
      } else {
        fallbackResult[key] = '';
      }
    })
  );

  return fallbackResult;
}
