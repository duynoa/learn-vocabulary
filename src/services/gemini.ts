import type { NewWord } from '@/types';

const GEMINI_STORAGE_KEY = 'gemini_api_key';

export function getGeminiApiKey(): string {
  const stored = localStorage.getItem(GEMINI_STORAGE_KEY)?.trim();
  if (stored) return stored;
  return (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || '';
}

export function saveGeminiApiKey(key: string): void {
  if (!key.trim()) {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  } else {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  }
}

export interface GenerateOptions {
  topic: string;
  count?: number;
  level?: 'A1-A2' | 'B1-B2' | 'C1-C2';
  existingWords?: string[];
}

export async function generateVocabularyWithGemini(options: GenerateOptions): Promise<NewWord[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chưa cấu hình Gemini API Key. Vui lòng nhập API Key để tiếp tục.');
  }

  const { topic, count = 5, level = 'B1-B2', existingWords = [] } = options;

  const prompt = `Bạn là chuyên gia giảng dạy tiếng Anh. Hãy tạo ${count} từ vựng tiếng Anh hay và thông dụng thuộc chủ đề "${topic}".
Trình độ mục tiêu: ${level}.
${existingWords.length > 0 ? `LƯU Ý: Tuyệt đối KHÔNG chọn trùng lặp các từ sau: ${existingWords.slice(0, 50).join(', ')}.` : ''}

Mỗi từ vựng phải cung cấp đầy đủ:
- word: từ tiếng Anh (dạng cơ bản, viết thường trừ tên riêng)
- pronunciation: phiên âm quốc tế IPA chuẩn, ví dụ /əˈtɛn.ʃən/
- part_of_speech: loại từ (noun, verb, adjective, adverb, phrase)
- meaning_vi: nghĩa tiếng Việt chính xác, súc tích và dễ hiểu
- example_en: câu ví dụ tự nhiên trong ngữ cảnh thực tế chứa từ này
- example_vi: bản dịch tiếng Việt của câu ví dụ trên`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            word: { type: 'string' },
            pronunciation: { type: 'string' },
            part_of_speech: { type: 'string' },
            meaning_vi: { type: 'string' },
            example_en: { type: 'string' },
            example_vi: { type: 'string' },
          },
          required: ['word', 'meaning_vi', 'part_of_speech', 'pronunciation', 'example_en', 'example_vi'],
        },
      },
    },
  };

  // Thử model gemini-2.5-flash trước, nếu không được thì fallback sang gemini-1.5-flash
  const models = ['gemini-3.6-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 400 || response.status === 403) {
          throw new Error(`API Key không hợp lệ hoặc không có quyền truy cập (${message})`);
        }
        if (response.status === 429) {
          throw new Error('Đã vượt quá giới hạn yêu cầu API (Rate limit / Quota exceeded). Vui lòng thử lại sau giây lát.');
        }
        throw new Error(message);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Không nhận được nội dung từ Gemini.');
      }

      const parsed = JSON.parse(rawText) as NewWord[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Định dạng dữ liệu trả về từ AI không hợp lệ.');
      }

      return parsed.map((item) => ({
        word: String(item.word || '').trim(),
        pronunciation: String(item.pronunciation || '').trim(),
        part_of_speech: String(item.part_of_speech || '').trim(),
        meaning_vi: String(item.meaning_vi || '').trim(),
        example_en: String(item.example_en || '').trim(),
        example_vi: String(item.example_vi || '').trim(),
      }));
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Nếu là lỗi API key thì không cần thử model tiếp theo
      if (lastError.message.includes('API Key không hợp lệ')) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Không thể kết nối tới Google Gemini. Vui lòng thử lại.');
}
