// Biến toàn cục giữ tham chiếu utterance để tránh Chrome V8 Garbage Collector dọn dẹp giữa chừng làm mất tiếng
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;

// Phát âm dự phòng qua Google TTS Audio khi Web Speech API bị lỗi hoặc không có tiếng
function speakWithAudio(word: string): void {
  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    const clean = encodeURIComponent(word.trim());
    const audio = new Audio(
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${clean}`
    );
    activeAudio = audio;
    audio.play().catch(() => {
      // Bỏ qua nếu autoplay bị chặn
    });
  } catch {
    // Bỏ qua lỗi fallback
  }
}

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  return (
    voices.find(
      (v) =>
        v.lang === 'en-US' &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

// Preload danh sách giọng đọc từ trình duyệt
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

export function speak(word: string): void {
  const trimmed = word?.trim();
  if (!trimmed) return;

  // Nếu trình duyệt không hỗ trợ Web Speech, dùng audio fallback ngay
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    speakWithAudio(trimmed);
    return;
  }

  // Khắc phục lỗi Chrome bị kẹt ở trạng thái paused
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Ngắt câu đọc trước đó nếu đang phát
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  // Trì hoãn một tick ngắn (~30ms) để Chrome xử lý xong sự kiện cancel(), tránh bị nuốt âm
  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Giữ tham chiếu ở biến toàn cục tránh việc V8 GC dọn dẹp làm mất tiếng
      activeUtterance = utterance;

      let started = false;

      utterance.onstart = () => {
        started = true;
      };

      utterance.onend = () => {
        activeUtterance = null;
      };

      utterance.onerror = () => {
        activeUtterance = null;
        speakWithAudio(trimmed);
      };

      // Đề phòng trường hợp trình duyệt hiển thị icon loa nhưng không hề kích hoạt onstart (bị treo/silent)
      setTimeout(() => {
        if (!started && activeUtterance === utterance) {
          window.speechSynthesis.resume();
        }
      }, 350);

      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch {
      speakWithAudio(trimmed);
    }
  }, 30);
}
