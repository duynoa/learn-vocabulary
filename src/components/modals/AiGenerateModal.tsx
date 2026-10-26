import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckSquare,
  Key,
  Loader2,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import type { NewWord } from '@/types';
import { generateVocabularyWithGemini, getGeminiApiKey, saveGeminiApiKey } from '@/services/gemini';
import { speak } from '@/utils/speech';

const SUGGESTED_TOPICS = [
  '☕ Giao tiếp hàng ngày',
  '💼 Phỏng vấn & Công sở',
  '✈️ Du lịch & Khách sạn',
  '💻 Công nghệ & Lập trình',
  '🏥 Sức khỏe & Y tế',
  '🎯 IELTS Speaking Topic',
  '🍽️ Ẩm thực & Nhà hàng',
];

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  existingWordNames?: string[];
  onSaveWords: (words: NewWord[]) => Promise<void>;
  showToast: (msg: string) => void;
}

export function AiGenerateModal({
  isOpen,
  onClose,
  initialTopic = '',
  existingWordNames = [],
  onSaveWords,
  showToast,
}: AiGenerateModalProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState<'A1-A2' | 'B1-B2' | 'C1-C2'>('B1-B2');
  const [count, setCount] = useState<number>(5);

  const [apiKey, setApiKey] = useState('');
  const [tempKey, setTempKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatedWords, setGeneratedWords] = useState<NewWord[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      const key = getGeminiApiKey();
      setApiKey(key);
      setTempKey(key);
      setShowKeyInput(!key);
      setError('');
      if (initialTopic) {
        setTopic(initialTopic);
      }
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    saveGeminiApiKey(tempKey);
    const key = getGeminiApiKey();
    setApiKey(key);
    setShowKeyInput(false);
    setError('');
    showToast('Đã lưu Gemini API Key!');
  };

  const handleGenerate = async () => {
    const currentKey = apiKey || tempKey;
    if (!currentKey) {
      setShowKeyInput(true);
      setError('Vui lòng nhập Gemini API Key để tiếp tục.');
      return;
    }
    if (!apiKey && tempKey) {
      saveGeminiApiKey(tempKey);
      setApiKey(tempKey);
      setShowKeyInput(false);
    }

    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề bạn muốn học.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const words = await generateVocabularyWithGemini({
        topic: topic.trim(),
        count,
        level,
        existingWords: existingWordNames,
      });

      setGeneratedWords(words);
      // Mặc định chọn tất cả từ vừa tạo
      setSelectedIndexes(new Set(words.map((_, i) => i)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo từ vựng.';
      setError(msg);
      if (msg.includes('API Key')) {
        setShowKeyInput(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndexes.size === generatedWords.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(generatedWords.map((_, i) => i)));
    }
  };

  const handleSaveSelected = async () => {
    const toSave = generatedWords.filter((_, i) => selectedIndexes.has(i));
    if (toSave.length === 0) {
      setError('Vui lòng chọn ít nhất một từ để thêm vào thư viện.');
      return;
    }

    setSaving(true);
    try {
      await onSaveWords(toSave);
      showToast(`Đã thêm thành công ${toSave.length} từ vào thư viện!`);
      setGeneratedWords([]);
      setSelectedIndexes(new Set());
      onClose();
    } catch {
      setError('Lưu từ thất bại. Vui lòng kiểm tra lại kết nối cơ sở dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#17231f]/50 p-4 backdrop-blur-sm animate-[fadeIn_.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-[#fbfcf9] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e5ebe1] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#8ca245] to-[#d9f36b] text-[#263f31] shadow-md shadow-[#8ca245]/20">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#203b2b]">
                Tạo từ vựng cùng Gemini AI
              </h2>
              <p className="text-xs sm:text-sm text-[#748379]">
                Sinh bộ từ vựng theo ngữ cảnh thực tế với phiên âm và ví dụ tự nhiên.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#7d8c83] hover:bg-[#eef2eb] hover:text-[#25392e] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
          {/* API Key Banner/Input */}
          {(!apiKey || showKeyInput) && (
            <div className="rounded-2xl border border-[#e8d2a6] bg-[#fdf8ed] p-4.5 text-sm text-[#745722]">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 font-bold text-[#624715]">
                  <Key size={16} /> Cấu hình Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold underline hover:text-[#372608]"
                >
                  Lấy key miễn phí ↗
                </a>
              </div>
              <p className="text-xs leading-5 text-[#866e40] mb-3">
                Bạn có thể dán API Key vào đây (được lưu an toàn trong trình duyệt của bạn) hoặc đặt trong file{' '}
                <code className="rounded bg-black/5 px-1 py-0.5">.env</code> với biến{' '}
                <code className="rounded bg-black/5 px-1 py-0.5">VITE_GEMINI_API_KEY</code>.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 rounded-xl border border-[#d8c397] bg-white px-3.5 py-2 text-xs outline-none focus:border-[#8ca245]"
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="rounded-xl bg-[#675427] px-4 py-2 text-xs font-bold text-white hover:bg-[#4d3d19] transition"
                >
                  Lưu Key
                </button>
              </div>
            </div>
          )}

          {apiKey && !showKeyInput && (
            <div className="flex items-center justify-between text-xs text-[#79887f]">
              <span className="flex items-center gap-1.5 text-[#517a2a] font-medium">
                <Check size={14} /> Gemini API Key đã sẵn sàng
              </span>
              {/* <button
                type="button"
                onClick={() => setShowKeyInput(true)}
                className="font-semibold text-[#6e8529] hover:underline"
              >
                Đổi API Key
              </button> */}
            </div>
          )}

          {/* Form input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#708075] mb-2">
              Chủ đề muốn học
            </label>
            <div className="relative">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Đàm phán kinh doanh, Món ăn đường phố, Đi phượt..."
                className="w-full rounded-2xl border border-[#dce3d8] bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-[#96b04b] focus:ring-2 focus:ring-[#e4eccf]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleGenerate();
                }}
              />
            </div>

            {/* Quick suggested topics */}
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => setTopic(suggested.replace(/^[^\s]+\s/, ''))}
                  className="rounded-lg border border-[#e2e8de] bg-[#f4f7f1] px-2.5 py-1 text-xs font-semibold text-[#57695d] hover:border-[#b4c878] hover:bg-[#ebf3dc] hover:text-[#384e20] transition"
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

          {/* Options: Level & Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#708075] mb-2">Trình độ</label>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#dde4d9] bg-[#edf2e9] p-1">
                {(['A1-A2', 'B1-B2', 'C1-C2'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${
                      level === lvl ? 'bg-white text-[#263f31] shadow-sm' : 'text-[#748378] hover:text-[#25392e]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#708075] mb-2">
                Số lượng từ
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#dde4d9] bg-[#edf2e9] p-1">
                {[5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${
                      count === num ? 'bg-white text-[#263f31] shadow-sm' : 'text-[#748378] hover:text-[#25392e]'
                    }`}
                  >
                    {num} từ
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button: Generate */}
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#263f31] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#263f31]/15 transition hover:bg-[#182b20] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-[#d9f36b]" />
                Gemini đang suy nghĩ và tạo từ vựng...
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-[#d9f36b]" />
                {generatedWords.length > 0 ? 'Tạo lại bộ từ khác' : 'Tạo từ vựng ngay'}
              </>
            )}
          </button>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#f0c5be] bg-[#fdf2f0] p-4 text-xs font-medium text-[#a34433]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results list */}
          {generatedWords.length > 0 && (
            <div className="pt-2">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#738278]">
                  Kết quả gợi ý ({selectedIndexes.size}/{generatedWords.length} từ đã chọn)
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#6f8828] hover:text-[#4a5f15]"
                >
                  {selectedIndexes.size === generatedWords.length ? (
                    <>
                      <Square size={14} /> Bỏ chọn tất cả
                    </>
                  ) : (
                    <>
                      <CheckSquare size={14} /> Chọn tất cả
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {generatedWords.map((item, idx) => {
                  const isSelected = selectedIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        isSelected
                          ? 'border-[#a8c65d] bg-[#f9fced]'
                          : 'border-[#e4eae0] bg-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(idx)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded accent-[#779229]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-lg font-bold text-[#233c2d]">{item.word}</span>
                              <span className="rounded-md bg-[#eef3e8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6f892b]">
                                {item.part_of_speech}
                              </span>
                              <span className="text-xs text-[#8c9a90]">{item.pronunciation}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speak(item.word);
                                }}
                                className="rounded p-1 text-[#78887e] hover:bg-[#e4ebd9] hover:text-[#263f31]"
                                title="Nghe phát âm"
                              >
                                <Volume2 size={13} />
                              </button>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[#446222]">{item.meaning_vi}</p>
                          </div>
                        </div>
                      </div>

                      {item.example_en && (
                        <div className="mt-3 border-l-2 border-[#c5d88f] pl-3 text-xs leading-5 text-[#5e6f64]">
                          <p className="italic">“{item.example_en}”</p>
                          {item.example_vi && <p className="text-[#89978e]">{item.example_vi}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedWords.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#e5ebe1] bg-[#f5f8f2] p-5 sm:px-7">
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={loading || saving}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6a8027] hover:text-[#435414]"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Tạo danh sách khác
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2.5 text-xs font-bold text-[#5c6e63] hover:bg-[#edf2e9]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void handleSaveSelected()}
                disabled={saving || selectedIndexes.size === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#263f31] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#263f31]/10 transition hover:bg-[#172b1e] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#d9f36b]" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Thêm {selectedIndexes.size} từ vào thư viện
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
