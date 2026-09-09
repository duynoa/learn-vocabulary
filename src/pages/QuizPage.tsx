import { useMemo, useState } from 'react';
import { Check, RotateCcw, Trophy, X } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import type { Word } from '@/types';

export function QuizPage() {
  const { words, updateWordProgress } = useVocabulary();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const quizWords = words.slice(0, 10);
  const question = quizWords[index];

  const options = useMemo(() => {
    if (!question) return [];
    const others = words
      .filter((word) => word.id !== question.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [question, ...others].sort(() => Math.random() - 0.5);
  }, [question, words]);

  if (done || !question) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center animate-[fadeIn_.4s_ease-out]">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#d9f36b] text-[#456218]">
          <Trophy size={30} />
        </div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Hoàn thành!</p>
        <h1 className="font-display text-4xl font-bold">Kết quả của bạn</h1>
        <p className="mt-3 text-[#78867d]">
          Bạn trả lời đúng <strong className="text-[#4d6d1f]">{score}/{quizWords.length}</strong> câu hỏi.
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setScore(0);
            setSelected(null);
            setDone(false);
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#172c20]"
        >
          <RotateCcw size={16} /> Làm lại
        </button>
      </div>
    );
  }

  const choose = async (option: Word) => {
    if (selected) return;
    const correct = option.id === question.id;
    setSelected(option.id);
    if (correct) setScore((current) => current + 1);
    await updateWordProgress(question, correct);
    setTimeout(() => {
      if (index + 1 >= quizWords.length) setDone(true);
      else {
        setIndex((current) => current + 1);
        setSelected(null);
      }
    }, 700);
  };

  return (
    <div className="mx-auto max-w-2xl animate-[fadeIn_.4s_ease-out]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Quick practice</p>
          <h1 className="font-display text-4xl font-bold tracking-tight">Chọn đáp án đúng</h1>
        </div>
        <span className="font-display text-lg font-bold text-[#829087]">
          {index + 1}
          <span className="text-sm"> / {quizWords.length}</span>
        </span>
      </div>

      <div className="mb-10 h-2 overflow-hidden rounded-full bg-[#e4eae0]">
        <div
          className="h-full rounded-full bg-[#9ebc4a] transition-all"
          style={{ width: `${(index / quizWords.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-[#e3e8df] bg-[#fbfcf9] p-7 text-center shadow-sm sm:p-12">
        <span className="rounded-full bg-[#edf3e6] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#789329]">
          {question.part_of_speech || 'Vocabulary'}
        </span>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-[#9aa59d]">Từ nào có nghĩa là</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#294432]">{question.meaning_vi}</h2>
        <div className="mt-10 grid gap-3 text-left">
          {options.map((option, optionIndex) => {
            const isSelected = selected === option.id;
            const isCorrect = option.id === question.id;
            return (
              <button
                key={option.id}
                onClick={() => void choose(option)}
                className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                  selected && isCorrect
                    ? 'border-[#a8c65d] bg-[#edf6d8] text-[#4b681c]'
                    : selected && isSelected
                    ? 'border-[#e7b6aa] bg-[#fff0ec] text-[#a95542]'
                    : 'border-[#e2e8df] bg-white hover:border-[#b7ca78] hover:bg-[#f9fced]'
                }`}
              >
                <span>
                  <span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg bg-[#f0f3ed] text-xs font-bold text-[#89958b]">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="font-display font-bold">{option.word}</span>
                </span>
                {selected && isCorrect && <Check size={18} />}
                {selected && isSelected && !isCorrect && <X size={18} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
