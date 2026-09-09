import { Headphones, Pencil, Trash2, X } from 'lucide-react';
import type { Progress, Word } from '@/types';
import { speak } from '@/utils/speech';

export function WordModal({
  word,
  progress,
  onClose,
  onEdit,
  onDelete,
}: {
  word: Word;
  progress?: Progress;
  onClose: () => void;
  onEdit: (word: Word) => void;
  onDelete: (word: Word) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#17231f]/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl bg-[#fbfcf9] p-7 shadow-2xl sm:p-9 animate-[fadeIn_.2s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="mb-3 flex gap-2">
              <span className="rounded-md bg-[#eef3e8] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#779229]">
                {word.part_of_speech || 'Từ vựng'}
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold">{word.word}</h2>
            <p className="mt-2 text-sm text-[#8a978e]">{word.pronunciation}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-[#eef2eb] p-2 text-[#78867d] hover:bg-[#e4eadf] transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="rounded-2xl bg-[#edf3e6] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#829755]">Nghĩa</p>
          <p className="mt-2 text-xl font-bold text-[#3f5726]">{word.meaning_vi}</p>
        </div>
        {(word.example_en || word.example_vi) && (
          <div className="mt-6 border-l-2 border-[#c8d98f] pl-4">
            {word.example_en && <p className="font-medium leading-7 text-[#526259]">“{word.example_en}”</p>}
            {word.example_vi && <p className="mt-1 text-sm italic text-[#8a978e]">{word.example_vi}</p>}
          </div>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-[#87938b]">
            {progress?.status === 'mastered' ? 'Đã thuộc' : progress?.status === 'learning' ? 'Đang học' : 'Chưa học'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(word)}
              className="flex items-center gap-1.5 rounded-xl border border-[#dfe6dc] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#54655b] hover:bg-[#f2f5ee] transition"
            >
              <Pencil size={15} /> Sửa
            </button>
            <button
              type="button"
              onClick={() => onDelete(word)}
              className="flex items-center gap-1.5 rounded-xl border border-[#f1d3cb] bg-[#fff2ed] px-3.5 py-2.5 text-sm font-semibold text-[#a34e39] hover:bg-[#fde8e1] transition"
            >
              <Trash2 size={15} /> Xóa
            </button>
            <button
              type="button"
              onClick={() => speak(word.word)}
              className="flex items-center gap-2 rounded-xl bg-[#263f31] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#172c20] transition"
            >
              <Headphones size={16} /> Nghe phát âm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
