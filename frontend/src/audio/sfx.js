export function getSfxUrl(name) {
  switch (name) {
    case 'buzz':
      return new URL('../assets/buzzer.mp3', import.meta.url).toString();
    case 'score':
      return new URL('../assets/correct.m4a', import.meta.url).toString();
    case 'penalty':
      return new URL('../assets/wrong.mp3', import.meta.url).toString();
    default:
      return null;
  }
}

export function playSfx(url, volume = 0.9) {
  if (!url) return;

  try {
    // neues Audio-Objekt pro Play, damit schnelle Trigger nicht unterdrückt werden.
    const audio = new Audio(url);
    audio.volume = volume;

    // iOS/Safari braucht oft user gesture. Wir nutzen socket-events (gehen oft durch Klick/Space vorher), aber fangen Fehler ab.
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    // no-op
  }
}

