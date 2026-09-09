import { useState } from 'react';
import { Check, Headphones, Mic2, X } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { EmptyState } from '@/components/common/EmptyState';
import { speak } from '@/utils/speech';

export function FlashcardsPage() {
  const { words, progressMap, updateWordProgress } = useVocabulary();
  const studyWords = words.filter((word) => progressMap.get(word.id)?.status !== 'mastered');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = studyWords[index % Math.max(studyWords.length, 1)];

  if (!word) {
    return (
      <EmptyState
        title="Bạn đã thuộc hết rồi!"
        text="Tuyệt vời. Hãy quay lại thư viện để xem lại hoặc thêm từ mới."
      />
    );
  }

  const next = async (correct: boolean) => {
    await updateWordProgress(word, correct);
    setFlipped(false);
    setIndex((current) => (current + 1) % studyWords.length);
  };

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_.4s_ease-out]">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Study mode</p>
          <h1 className="font-display text-4xl font-bold tracking-tight">Flashcard</h1>
          <p className="mt-2 text-[#78867d]">Lật thẻ, ghi nhớ và xây dựng phản xạ.</p>
        </div>
        <span className="text-sm font-bold text-[#89958b]">
          {index + 1} / {studyWords.length}
        </span>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#e4eae0]">
        <div
          className="h-full rounded-full bg-[#9ebc4a] transition-all"
          style={{ width: `${((index + 1) / studyWords.length) * 100}%` }}
        />
      </div>

      <button
        onClick={() => setFlipped((current) => !current)}
        className="group relative mb-3 flex min-h-[390px] w-full items-center justify-center overflow-hidden rounded-3xl bg-[#263f31] p-10 text-center text-white shadow-2xl shadow-[#263f31]/20 transition hover:-translate-y-1"
      >
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/10" />
        <div className="absolute bottom-[-40px] left-[-30px] h-40 w-40 rounded-full border border-[#d9f36b]/15" />
        {!flipped ? (
          <div>
            <span className="mb-6 inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#d9f36b]">
              {word.part_of_speech || 'Vocabulary'}
            </span>
            <h2 className="font-display text-6xl font-bold tracking-tight sm:text-7xl">{word.word}</h2>
            <div className="mt-5 flex items-center justify-center gap-2 text-[#b5c6b7]">
              <span>{word.pronunciation}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                <Headphones size={15} />
              </span>
            </div>
            <p className="mt-10 text-sm text-[#afc1b2]">Nhấn để lật thẻ</p>
          </div>
        ) : (
          <div>
            <span className="mb-5 block text-sm font-semibold uppercase tracking-wider text-[#b6c873]">
              Nghĩa tiếng Việt
            </span>
            <h2 className="font-display text-4xl font-bold text-[#f1f8d9]">{word.meaning_vi}</h2>
            {word.example_en && (
              <p className="mx-auto mt-8 max-w-md text-base leading-7 text-[#b9c9bb]">{word.example_en}</p>
            )}
            {word.example_vi && <p className="mt-2 text-sm italic text-[#819987]">{word.example_vi}</p>}
          </div>
        )}
      </button>

      <div className="flex gap-3">
        {flipped && (
          <>
            <button
              onClick={() => void next(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#edc5bb] bg-[#fff4f0] py-3.5 text-sm font-bold text-[#a85a46] transition hover:bg-[#fce6df]"
            >
              <X size={17} /> Chưa nhớ
            </button>
            <button
              onClick={() => void next(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d9f36b] py-3.5 text-sm font-bold text-[#334b1c] transition hover:bg-[#cdea58]"
            >
              <Check size={17} /> Đã nhớ
            </button>
          </>
        )}
      </div>

      {!flipped && (
        <button
          onClick={() => speak(word.word)}
          className="mx-auto mt-5 flex items-center gap-2 text-sm font-bold text-[#789329] hover:text-[#506c16]"
        >
          <Mic2 size={16} /> Nghe phát âm
        </button>
      )}
    </div>
  );
}
