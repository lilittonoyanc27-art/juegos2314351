// Speech Synthesis helper for spoken Spanish and Armenian pronunciation

export function speakText(text: string, lang: 'es' | 'hy' = 'es') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel prior speech
  window.speechSynthesis.cancel();

  // Clean text from emojis like 🇪🇸 or 🇦🇲
  const clean = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[🇪🇸🇦🇲]/g, '').trim();
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang === 'es' ? 'es-ES' : 'hy-AM';
  utterance.rate = 0.9; // Slightly slower for language learners

  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find((v) => 
    lang === 'es' ? v.lang.startsWith('es') : v.lang.startsWith('hy')
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
}
