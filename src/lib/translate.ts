export async function autoTranslate(text: string, from = 'ar', to = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    const res = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), sl: from, tl: to }),
    });
    const data = await res.json();
    return data.translated || '';
  } catch (err) {
    console.error('Auto-translate error:', err);
    return '';
  }
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
    const data = await res.json();
    return data.translated || {};
  } catch (err) {
    console.error('Auto-translate batch error:', err);
    return {};
  }
}
