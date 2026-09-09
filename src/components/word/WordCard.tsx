import { Headphones, Pencil, Trash2 } from 'lucide-react';
import type { Progress, Word } from '@/types';
import { speak } from '@/utils/speech';

export function WordCard({
  word,
  progress,
  onClick,
  onEdit,
  onDelete,
}: {
  word: Word;
  progress?: Progress;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-5 text-left transition hover:-translate-y-1 hover:border-[#bdcf83] hover:shadow-lg hover:shadow-[#b6c98e]/10"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#f1f3ed] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#779229]">
            {word.part_of_speech || 'word'}
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              progress?.status === 'mastered'
                ? 'bg-[#8fb44a]'
                : progress?.status === 'learning'
                ? 'bg-[#eab95e]'
                : 'bg-[#cbd4cc]'
            }`}
          />
        </div>
        <div className="flex items-center gap-1 opacity-70 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Chỉnh sửa từ này"
            className="rounded-lg p-1.5 text-[#6c7d75] hover:bg-[#eef2eb] hover:text-[#2c4033] transition"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Xóa từ này"
            className="rounded-lg p-1.5 text-[#9e5f52] hover:bg-[#fdebe7] hover:text-[#a34e39] transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h3 className="font-display text-2xl font-bold tracking-tight group-hover:text-[#789329]">{word.word}</h3>
      <div className="mt-1 flex items-center gap-2 text-sm text-[#87938b]">
        <span>{word.pronunciation}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            speak(word.word);
          }}
          className="rounded-full p-1.5 hover:bg-[#eaf1de] hover:text-[#789329]"
        >
          <Headphones size={14} />
        </button>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#4f5f56]">{word.meaning_vi}</p>
      {word.example_en && <p className="mt-3 line-clamp-1 text-xs italic text-[#91a099]">“{word.example_en}”</p>}
    </div>
  );
}
