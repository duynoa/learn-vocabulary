import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Target, Trophy, Zap } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { Stat } from '@/components/common/Stat';

export function DashboardPage() {
  const navigate = useNavigate();
  const { words, mastered, learning, accuracy, progressMap } = useVocabulary();
  const recent = words.filter((word) => progressMap.has(word.id)).slice(0, 6);

  return (
    <div className="animate-[fadeIn_.4s_ease-out]">
      <section className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Your learning space</p>
          <h1 className="font-display text-4xl font-bold tracking-[-.04em] text-[#203b2b] sm:text-5xl">
            Học tốt hơn,
            <br />
            <span className="text-[#8da72e]">từng từ một.</span>
          </h1>
          <p className="mt-4 max-w-md leading-7 text-[#718078]">
            Xây dựng vốn từ vựng tự tin với những bài học ngắn, rõ ràng và thú vị.
          </p>
        </div>
        <button
          onClick={() => navigate('/flashcards')}
          className="group flex w-fit items-center gap-3 rounded-xl bg-[#263f31] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#263f31]/10 transition hover:-translate-y-0.5 hover:bg-[#172c20]"
        >
          Bắt đầu học{' '}
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d9f36b] text-[#263f31] transition group-hover:translate-x-1">
            <ArrowRight size={14} />
          </span>
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<BookOpen size={19} />} label="Tổng số từ" value={words.length} suffix=" từ" tint="lime" />
        <Stat icon={<Zap size={19} />} label="Đang học" value={learning} suffix=" từ" tint="yellow" />
        <Stat icon={<Trophy size={19} />} label="Đã thuộc" value={mastered} suffix=" từ" tint="blue" />
        <Stat icon={<Target size={19} />} label="Độ chính xác" value={accuracy} suffix="%" tint="peach" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl bg-[#dbeef0] p-6 sm:p-8">
          <div className="relative z-10 max-w-md">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#3b7070]">
              <Headphones size={20} />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#1e4c4a]">
              Mỗi ngày một chút,
              <br />
              tiến bộ thật nhiều.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#4f7470]">
              Ôn lại những từ bạn đã học và rèn luyện phản xạ ghi nhớ từ vựng tự nhiên.
            </p>
            <button
              onClick={() => navigate('/flashcards')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#315e5a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244d49]"
            >
              Ôn tập ngay <ArrowRight size={16} />
            </button>
          </div>
          <div className="relative -mb-8 ml-auto mt-5 h-20 w-48 opacity-70">
            <div className="absolute right-8 top-2 h-20 w-20 rotate-12 rounded-[25px] border-2 border-[#6fa4a1] bg-white/50" />
            <div className="absolute right-0 top-10 h-16 w-28 -rotate-6 rounded-[22px] border-2 border-[#6fa4a1] bg-white/40" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Thư viện từ vựng</h2>
            <p className="mt-1 text-sm text-[#849189]">Tổng cộng {words.length} từ vựng đã sẵn sàng</p>
          </div>
          <div className="my-6 rounded-2xl bg-[#edf3e6] p-4 text-center">
            <p className="text-3xl font-display font-bold text-[#3d5a23]">{words.length}</p>
            <p className="text-xs font-semibold text-[#768a5c] mt-1">Từ trong kho dữ liệu</p>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#263f31] py-3 text-sm font-bold text-white transition hover:bg-[#172c20]"
          >
            Xem toàn bộ từ vựng <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mt-8 rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Tiếp tục học</h2>
            <button onClick={() => navigate('/library')} className="text-sm font-bold text-[#779229]">
              Mở thư viện
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {recent.map((word) => (
              <button
                key={word.id}
                onClick={() => navigate('/library')}
                className="rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold">{word.word}</span>
                  <span className="text-[10px] font-semibold text-[#8a988e]">{word.part_of_speech}</span>
                </div>
                <p className="mt-1 text-xs text-[#86928a] line-clamp-1">{word.meaning_vi}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
