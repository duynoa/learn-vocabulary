import { useState } from 'react';
import { BookOpen, ListFilter, Plus, Search } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { WordCard } from '@/components/word/WordCard';

export function LibraryPage() {
  const { words, progressMap, setSelectedWord, setEditingWord, setDeletingWord, setIsAddModalOpen } = useVocabulary();
  const [search, setSearch] = useState('');

  const filtered = words.filter((word) =>
    `${word.word} ${word.meaning_vi}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-[fadeIn_.4s_ease-out]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Your collection</p>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Thư viện từ</h1>
            <p className="mt-2 text-[#78867d]">Khám phá {words.length} từ vựng trong kho của bạn.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-[#e8f2cf] px-4 py-3 text-sm font-bold text-[#57711f]">
              <BookOpen className="mr-2 inline" size={16} /> {filtered.length} kết quả
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#263f31]/10 transition hover:-translate-y-0.5 hover:bg-[#172c20]"
            >
              <Plus size={16} /> Thêm từ mới
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa69e]" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm từ hoặc nghĩa tiếng Việt..."
            className="w-full rounded-xl border border-[#dfe6dc] bg-[#fbfcf9] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#a8bd66] focus:ring-2 focus:ring-[#dce9bb]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            progress={progressMap.get(word.id)}
            onClick={() => setSelectedWord(word)}
            onEdit={() => setEditingWord(word)}
            onDelete={() => setDeletingWord(word)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#ccd7c9] py-20 text-center">
          <ListFilter className="mx-auto mb-3 text-[#a9b6a9]" />
          <p className="font-semibold text-[#718078]">Không tìm thấy từ phù hợp</p>
          <p className="mt-1 text-sm text-[#9aa69e]">Thử thay đổi từ khóa tìm kiếm hoặc bấm thêm từ mới vào kho.</p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#263f31] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172c20]"
          >
            <Plus size={16} /> Thêm từ mới ngay
          </button>
        </div>
      )}
    </div>
  );
}
