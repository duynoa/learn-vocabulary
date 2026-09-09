import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Volume2, Wand2 } from 'lucide-react';
import type { NewWord, Word } from '@/types';
import { speak } from '@/utils/speech';
import { Field, inputClass } from './Field';

export const commonPartsOfSpeech = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'phrase',
  'phrasal verb',
  'idiom',
  'preposition',
  'pronoun',
  'conjunction',
  'interjection',
];

export function WordForm({
  initialWord,
  onSave,
  onCancel,
  submitLabel = 'Lưu từ vựng',
  isModal = false,
}: {
  initialWord?: Word | null;
  onSave: (data: NewWord) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isModal?: boolean;
}) {
  const [form, setForm] = useState<NewWord>({
    word: initialWord?.word || '',
    pronunciation: initialWord?.pronunciation || '',
    part_of_speech: initialWord?.part_of_speech || 'noun',
    meaning_vi: initialWord?.meaning_vi || '',
    example_en: initialWord?.example_en || '',
    example_vi: initialWord?.example_vi || '',
  });

  const [isCustomPartOfSpeech, setIsCustomPartOfSpeech] = useState(
    Boolean(initialWord?.part_of_speech && !commonPartsOfSpeech.includes(initialWord.part_of_speech))
  );
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [validation, setValidation] = useState('');
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (initialWord) {
      setForm({
        word: initialWord.word,
        pronunciation: initialWord.pronunciation || '',
        part_of_speech: initialWord.part_of_speech || 'noun',
        meaning_vi: initialWord.meaning_vi,
        example_en: initialWord.example_en || '',
        example_vi: initialWord.example_vi || '',
      });
      setIsCustomPartOfSpeech(
        Boolean(initialWord.part_of_speech && !commonPartsOfSpeech.includes(initialWord.part_of_speech))
      );
    } else {
      setForm({
        word: '',
        pronunciation: '',
        part_of_speech: 'noun',
        meaning_vi: '',
        example_en: '',
        example_vi: '',
      });
      setIsCustomPartOfSpeech(false);
    }
    setValidation('');
    setLookupMessage('');
  }, [initialWord]);

  function update<K extends keyof NewWord>(key: K, value: NewWord[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setValidation('');
  }

  // Hàm fetch có timeout tránh treo giao diện khi server từ điển bị sự cố
  async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  // Tự động tra cứu từ điển với cơ chế đa nguồn (tránh lỗi 522 của dictionaryapi.dev)
  async function fetchDictionaryData(wordToSearch: string, isManual = false) {
    const trimmed = wordToSearch.trim();
    if (!trimmed || trimmed.includes(' ')) {
      if (isManual) setLookupMessage('Vui lòng nhập từ đơn để tự động tra cứu từ điển.');
      return;
    }

    setLookingUp(true);
    setLookupMessage('');
    try {
      let ipa = '';
      let pos = '';
      let example = '';
      let found = false;

      // Nguồn 1: freedictionaryapi.com (Miễn phí, phản hồi nhanh, không bị 522 Cloudflare)
      try {
        const response = await fetchWithTimeout(
          `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(trimmed.toLowerCase())}`,
          3500
        );
        if (response.ok) {
          interface FreeDictEntry {
            partOfSpeech?: string;
            pronunciations?: Array<{ type?: string; text?: string }>;
            senses?: Array<{ definition?: string; examples?: string[] }>;
          }
          interface FreeDictData {
            entries?: FreeDictEntry[];
          }
          const json = (await response.json()) as FreeDictData;
          if (Array.isArray(json.entries) && json.entries.length > 0) {
            const entry = json.entries[0];
            pos = entry.partOfSpeech || '';
            const ipaFound = entry.pronunciations?.find((p) => p.type === 'ipa' && p.text) || entry.pronunciations?.[0];
            ipa = ipaFound?.text || '';

            for (const item of json.entries) {
              if (item.senses) {
                for (const sense of item.senses) {
                  if (sense.examples && sense.examples.length > 0 && sense.examples[0]) {
                    example = sense.examples[0].split('\n')[0].trim();
                    break;
                  }
                }
              }
              if (example) break;
            }
            found = true;
          }
        }
      } catch {
        // Nguồn 1 timeout hoặc lỗi mạng
      }

      // Nguồn 2: Datamuse API (Rất ổn định, dự phòng phát âm IPA & từ loại)
      if (!found || !ipa) {
        try {
          const response = await fetchWithTimeout(
            `https://api.datamuse.com/words?sp=${encodeURIComponent(trimmed.toLowerCase())}&md=dp&ipa=1&max=1`,
            3000
          );
          if (response.ok) {
            interface DatamuseItem {
              tags?: string[];
              defs?: string[];
            }
            const items = (await response.json()) as DatamuseItem[];
            if (Array.isArray(items) && items.length > 0) {
              const item = items[0];
              if (!ipa && item.tags) {
                const ipaTag = item.tags.find((t) => t.startsWith('ipa_pron:'));
                if (ipaTag) {
                  ipa = `/${ipaTag.replace('ipa_pron:', '').trim()}/`;
                }
              }
              if (!pos && item.tags) {
                if (item.tags.includes('n')) pos = 'noun';
                else if (item.tags.includes('v')) pos = 'verb';
                else if (item.tags.includes('adj')) pos = 'adjective';
                else if (item.tags.includes('adv')) pos = 'adverb';
              }
              found = true;
            }
          }
        } catch {
          // Bỏ qua lỗi fallback
        }
      }

      // Nguồn 3: api.dictionaryapi.dev (Timeout ngắn 2.5s để không làm treo ứng dụng nếu bị 522)
      if (!found || !example) {
        try {
          const response = await fetchWithTimeout(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed.toLowerCase())}`,
            2500
          );
          if (response.ok) {
            interface DictPhonetic { text?: string }
            interface DictDefinition { example?: string }
            interface DictMeaning { partOfSpeech?: string; definitions?: DictDefinition[] }
            interface DictEntry { phonetic?: string; phonetics?: DictPhonetic[]; meanings?: DictMeaning[] }

            const data = (await response.json()) as DictEntry[];
            if (Array.isArray(data) && data.length > 0) {
              const item = data[0];
              if (!ipa) ipa = item.phonetic || item.phonetics?.find((p) => p.text)?.text || '';
              if (!pos) pos = item.meanings?.[0]?.partOfSpeech || '';
              if (!example && Array.isArray(item.meanings)) {
                for (const m of item.meanings) {
                  for (const d of m.definitions || []) {
                    if (d.example) {
                      example = d.example;
                      break;
                    }
                  }
                  if (example) break;
                }
              }
              found = true;
            }
          }
        } catch {
          // Bỏ qua lỗi 522 / timeout từ dictionaryapi.dev
        }
      }

      if (!found && !ipa && !pos) {
        if (isManual) setLookupMessage('Không tìm thấy từ điển cho từ này. Bạn có thể tự nhập phiên âm bên dưới.');
        return;
      }

      setForm((prev) => ({
        ...prev,
        pronunciation: prev.pronunciation || ipa,
        part_of_speech: prev.part_of_speech === 'noun' && pos ? pos : prev.part_of_speech,
        example_en: prev.example_en || example,
      }));

      if (pos && !commonPartsOfSpeech.includes(pos)) {
        setIsCustomPartOfSpeech(true);
      }

      setLookupMessage('✨ Đã tự động lấy phát âm & loại từ từ từ điển!');
      setTimeout(() => setLookupMessage(''), 3500);
    } catch {
      if (isManual) setLookupMessage('Không thể kết nối với từ điển.');
    } finally {
      setLookingUp(false);
    }
  }

  function handleWordChange(val: string) {
    update('word', val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (val.trim().length >= 2 && !val.trim().includes(' ')) {
      debounceTimer.current = window.setTimeout(() => {
        void fetchDictionaryData(val);
      }, 800);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.word.trim() || !form.meaning_vi.trim()) {
      setValidation('Vui lòng nhập từ tiếng Anh và nghĩa tiếng Việt.');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Từ tiếng Anh */}
        <Field label="Từ tiếng Anh" required>
          <div className="relative">
            <input
              value={form.word}
              onChange={(event) => handleWordChange(event.target.value)}
              placeholder="ví dụ: serendipity"
              className={`${inputClass} pr-20`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {form.word.trim() && (
                <button
                  type="button"
                  onClick={() => speak(form.word)}
                  title="Nghe phát âm thử"
                  className="p-1.5 text-[#78867d] hover:text-[#789329] hover:bg-[#edf3e6] rounded-lg transition"
                >
                  <Volume2 size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => void fetchDictionaryData(form.word, true)}
                disabled={lookingUp || !form.word.trim()}
                title="Tự động tra phát âm & loại từ từ từ điển"
                className="p-1.5 text-[#789329] hover:bg-[#edf3e6] rounded-lg transition disabled:opacity-40"
              >
                {lookingUp ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              </button>
            </div>
          </div>
          {lookupMessage && (
            <p
              className={`mt-1.5 text-xs font-semibold ${
                lookupMessage.includes('✨') ? 'text-[#5f7e27]' : 'text-[#a34e39]'
              }`}
            >
              {lookupMessage}
            </p>
          )}
        </Field>

        {/* Nghĩa tiếng Việt */}
        <Field label="Nghĩa tiếng Việt" required>
          <input
            value={form.meaning_vi}
            onChange={(event) => update('meaning_vi', event.target.value)}
            placeholder="ví dụ: sự tình cờ may mắn"
            className={inputClass}
          />
        </Field>

        {/* Phát âm (IPA) */}
        <Field label="Phát âm (IPA)">
          <div className="relative">
            <input
              value={form.pronunciation}
              onChange={(event) => update('pronunciation', event.target.value)}
              placeholder="/ˌser.ənˈdɪp.ə.ti/"
              className={`${inputClass} pr-10`}
            />
            {form.pronunciation && (
              <button
                type="button"
                onClick={() => speak(form.word)}
                title="Phát âm thử từ này"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78867d] hover:text-[#789329]"
              >
                <Volume2 size={16} />
              </button>
            )}
          </div>
        </Field>

        {/* Từ loại */}
        <Field label="Từ loại">
          <div className="flex gap-2">
            {isCustomPartOfSpeech ? (
              <input
                value={form.part_of_speech}
                onChange={(event) => update('part_of_speech', event.target.value)}
                placeholder="ví dụ: phrasal verb, idiom..."
                className={inputClass}
                autoFocus
              />
            ) : (
              <select
                value={form.part_of_speech}
                onChange={(event) => update('part_of_speech', event.target.value)}
                className={inputClass}
              >
                {commonPartsOfSpeech.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => {
                setIsCustomPartOfSpeech(!isCustomPartOfSpeech);
                if (isCustomPartOfSpeech && !commonPartsOfSpeech.includes(form.part_of_speech)) {
                  update('part_of_speech', 'noun');
                }
              }}
              className="shrink-0 rounded-xl border border-[#dfe6dc] px-3 text-xs font-bold text-[#78867d] hover:bg-[#eef2eb] transition"
            >
              {isCustomPartOfSpeech ? 'Chọn sẵn' : 'Tự gõ'}
            </button>
          </div>
        </Field>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="Ví dụ tiếng Anh">
          <textarea
            value={form.example_en}
            onChange={(event) => update('example_en', event.target.value)}
            placeholder="Finding this café was pure serendipity."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </Field>
        <Field label="Ví dụ dịch tiếng Việt">
          <textarea
            value={form.example_vi}
            onChange={(event) => update('example_vi', event.target.value)}
            placeholder="Tìm thấy quán cà phê này là một sự tình cờ may mắn."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>

      {validation && (
        <div className="mt-5 rounded-xl border border-[#f1d3cb] bg-[#fff2ed] px-4 py-3 text-sm text-[#a34e39]">
          {validation}
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#dfe6dc] px-5 py-3 text-sm font-bold text-[#78867d] transition hover:bg-[#eef2eb]"
          >
            Hủy
          </button>
        )}
        {!isModal && (
          <button
            type="button"
            onClick={() => {
              setForm({
                word: '',
                pronunciation: '',
                part_of_speech: 'noun',
                meaning_vi: '',
                example_en: '',
                example_vi: '',
              });
              setIsCustomPartOfSpeech(false);
              setLookupMessage('');
            }}
            className="rounded-xl border border-[#dfe6dc] px-5 py-3 text-sm font-bold text-[#78867d] transition hover:bg-[#eef2eb]"
          >
            Xóa form
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#172c20] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <Plus size={16} /> {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
