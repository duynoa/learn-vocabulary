import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowRight, BookOpen, Check, CircleHelp,
  Flame, Headphones, Home, Library, ListFilter, Loader2, Menu, Mic2, Plus,
  RotateCcw, Search, Settings2, Sparkles, Target, Trophy, Volume2, Wand2, X, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { NewWord, Page, Progress, Word } from '@/types';

function speak(word: string) {
  if (!word || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      const [wordsResult, progressResult] = await Promise.all([
        supabase.from('words').select('*').order('created_at'),
        supabase.from('progress').select('*'),
      ]);
      if (wordsResult.error || progressResult.error) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } else {
        setWords((wordsResult.data ?? []) as Word[]);
        setProgress((progressResult.data ?? []) as Progress[]);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const progressMap = useMemo(() => new Map(progress.map((item) => [item.word_id, item])), [progress]);
  const mastered = progress.filter((item) => item.status === 'mastered').length;
  const learning = progress.filter((item) => item.status === 'learning').length;
  const studiedToday = progress.filter((item) => item.last_reviewed_at && new Date(item.last_reviewed_at).toDateString() === new Date().toDateString()).length;
  const accuracy = progress.length ? Math.round(progress.reduce((sum, item) => sum + (item.review_count ? item.correct_count / item.review_count : 0), 0) / progress.length * 100) : 0;

  async function updateWordProgress(word: Word, correct: boolean) {
    const old = progressMap.get(word.id);
    const reviewCount = (old?.review_count ?? 0) + 1;
    const correctCount = (old?.correct_count ?? 0) + (correct ? 1 : 0);
    const next: Progress = {
      word_id: word.id,
      review_count: reviewCount,
      correct_count: correctCount,
      status: correctCount >= 3 ? 'mastered' : 'learning',
      last_reviewed_at: new Date().toISOString(),
    };
    setProgress((current) => [...current.filter((item) => item.word_id !== word.id), next]);
    const { error: saveError } = await supabase.from('progress').upsert(next, { onConflict: 'word_id' });
    if (saveError) setError('Chưa lưu được tiến độ của bạn.');
  }

  async function addWord(input: NewWord) {
    const payload = {
      word: input.word.trim(),
      pronunciation: input.pronunciation.trim() || null,
      part_of_speech: input.part_of_speech.trim() || null,
      meaning_vi: input.meaning_vi.trim(),
      example_en: input.example_en.trim() || null,
      example_vi: input.example_vi.trim() || null,
    };
    const { data, error: insertError } = await supabase.from('words').insert(payload).select().single();
    if (insertError) throw insertError;
    const created = data as Word;
    setWords((current) => [created, ...current]);
    return created;
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  }

  function startStudy() { setPage('flashcards'); setMobileNav(false); }

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#f6f7f2]"><div className="text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#d9f36b] text-[#17231f]"><Sparkles size={24} /></div><p className="font-display text-lg font-semibold">Đang chuẩn bị bài học...</p></div></div>;

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#17231f]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-[#e3e8df] bg-[#f9faf6] p-6 transition-transform lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9f36b] text-[#203325]"><Sparkles size={19} strokeWidth={2.5} /></div><span className="font-display text-[22px] font-bold tracking-tight">wordly<span className="text-[#8aa52f]">.</span></span></div>
        <nav className="space-y-2">
          <NavButton icon={<Home size={18} />} label="Tổng quan" active={page === 'dashboard'} onClick={() => { setPage('dashboard'); setMobileNav(false); }} />
          <NavButton icon={<Library size={18} />} label="Thư viện từ" active={page === 'library'} onClick={() => { setPage('library'); setMobileNav(false); }} />
          <NavButton icon={<RotateCcw size={18} />} label="Flashcard" active={page === 'flashcards'} onClick={() => { setPage('flashcards'); setMobileNav(false); }} />
          <NavButton icon={<CircleHelp size={18} />} label="Luyện tập" active={page === 'quiz'} onClick={() => { setPage('quiz'); setMobileNav(false); }} />
          <NavButton icon={<Plus size={18} />} label="Thêm từ" active={page === 'add'} onClick={() => { setPage('add'); setMobileNav(false); }} />
        </nav>
        <div className="mt-auto rounded-2xl bg-[#edf3e6] p-4"><div className="mb-3 flex items-center gap-2 text-[#5d7730]"><Target size={17} /><span className="text-xs font-bold uppercase tracking-wider">Mục tiêu hôm nay</span></div><div className="mb-2 flex items-end justify-between"><span className="font-display text-2xl font-bold">{studiedToday}<span className="text-sm font-medium text-[#78905b]"> / 10 từ</span></span><span className="text-sm font-semibold text-[#6c8641]">{Math.min(studiedToday * 10, 100)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#d8e4cc]"><div className="h-full rounded-full bg-[#91ad3a] transition-all" style={{ width: `${Math.min(studiedToday * 10, 100)}%` }} /></div></div>
        <button className="mt-5 flex items-center gap-3 px-2 py-2 text-sm font-semibold text-[#708078] transition hover:text-[#203325]"><Settings2 size={18} /> Cài đặt</button>
      </aside>
      {mobileNav && <button aria-label="Đóng menu" className="fixed inset-0 z-20 bg-[#17231f]/20 lg:hidden" onClick={() => setMobileNav(false)} />}
      <main className="lg:ml-[252px]">
        <header className="flex h-fit items-center justify-between border-b border-[#e3e8df] bg-[#f9faf6]/80 px-5 backdrop-blur lg:px-10">
          <button className="rounded-lg p-2 hover:bg-[#edf2e9] lg:hidden" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
          <div className="hidden text-sm font-medium text-[#7b8880] lg:block">Chào mừng bạn quay trở lại!</div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-[#fff3d6] px-3 py-2 text-sm font-bold text-[#b47e23] sm:flex"><Flame size={16} fill="currentColor" /> 5 ngày</div>
          </div>
        </header>
        <div className="mx-auto max-w-[1420px] px-5 py-5 lg:px-10 lg:py-10">
          {error && <div className="mb-5 flex items-center justify-between rounded-xl border border-[#f1d3cb] bg-[#fff2ed] px-4 py-3 text-sm text-[#a34e39]"><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}
          {page === 'dashboard' && <Dashboard words={words} mastered={mastered} learning={learning} accuracy={accuracy} onStudy={startStudy} onLibrary={() => setPage('library')} progressMap={progressMap} />}
          {page === 'library' && <LibraryPage words={words} search={search} setSearch={setSearch} onSelect={setSelectedWord} progressMap={progressMap} />}
          {page === 'flashcards' && <Flashcards words={words} progressMap={progressMap} onProgress={updateWordProgress} />}
          {page === 'quiz' && <Quiz words={words} onProgress={updateWordProgress} />}
          {page === 'add' && <AddWordPage onAdd={addWord} onDone={() => { setPage('library'); showToast('Đã thêm từ mới vào thư viện!'); }} onError={() => showToast('Không thêm được từ. Vui lòng thử lại.')} />}
        </div>
      </main>
      {selectedWord && <WordModal word={selectedWord} progress={progressMap.get(selectedWord.id)} onClose={() => setSelectedWord(null)} />}
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[#e8f2cf] text-[#39551d]' : 'text-[#718078] hover:bg-[#eef2eb] hover:text-[#253c2f]'}`}>{icon}<span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#89a72e]" />}</button>;
}

function Dashboard({ words, mastered, learning, accuracy, onStudy, onLibrary, progressMap }: { words: Word[]; mastered: number; learning: number; accuracy: number; onStudy: () => void; onLibrary: () => void; progressMap: Map<string, Progress> }) {
  const recent = words.filter((word) => progressMap.has(word.id)).slice(0, 6);
  return <div className="animate-[fadeIn_.4s_ease-out]"><section className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Your learning space</p><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-[#203b2b] sm:text-5xl">Học tốt hơn,<br /><span className="text-[#8da72e]">từng từ một.</span></h1><p className="mt-4 max-w-md leading-7 text-[#718078]">Xây dựng vốn từ vựng tự tin với những bài học ngắn, rõ ràng và thú vị.</p></div><button onClick={onStudy} className="group flex w-fit items-center gap-3 rounded-xl bg-[#263f31] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#263f31]/10 transition hover:-translate-y-0.5 hover:bg-[#172c20]">Bắt đầu học <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d9f36b] text-[#263f31] transition group-hover:translate-x-1"><ArrowRight size={14} /></span></button></section>
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={<BookOpen size={19} />} label="Tổng số từ" value={words.length} suffix=" từ" tint="lime" /><Stat icon={<Zap size={19} />} label="Đang học" value={learning} suffix=" từ" tint="yellow" /><Stat icon={<Trophy size={19} />} label="Đã thuộc" value={mastered} suffix=" từ" tint="blue" /><Stat icon={<Target size={19} />} label="Độ chính xác" value={accuracy} suffix="%" tint="peach" /></section>
    <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]"><div className="overflow-hidden rounded-2xl bg-[#dbeef0] p-6 sm:p-8"><div className="relative z-10 max-w-md"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#3b7070]"><Headphones size={20} /></div><h2 className="font-display text-2xl font-bold tracking-tight text-[#1e4c4a]">Mỗi ngày một chút,<br />tiến bộ thật nhiều.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#4f7470]">Ôn lại những từ bạn đã học và rèn luyện phản xạ ghi nhớ từ vựng tự nhiên.</p><button onClick={onStudy} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#315e5a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244d49]">Ôn tập ngay <ArrowRight size={16} /></button></div><div className="relative -mb-8 ml-auto mt-5 h-20 w-48 opacity-70"><div className="absolute right-8 top-2 h-20 w-20 rotate-12 rounded-[25px] border-2 border-[#6fa4a1] bg-white/50" /><div className="absolute right-0 top-10 h-16 w-28 -rotate-6 rounded-[22px] border-2 border-[#6fa4a1] bg-white/40" /></div></div><div className="rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-6 sm:p-8 flex flex-col justify-between"><div><h2 className="font-display text-lg font-bold">Thư viện từ vựng</h2><p className="mt-1 text-sm text-[#849189]">Tổng cộng {words.length} từ vựng đã sẵn sàng</p></div><div className="my-6 rounded-2xl bg-[#edf3e6] p-4 text-center"><p className="text-3xl font-display font-bold text-[#3d5a23]">{words.length}</p><p className="text-xs font-semibold text-[#768a5c] mt-1">Từ trong kho dữ liệu</p></div><button onClick={onLibrary} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#263f31] py-3 text-sm font-bold text-white transition hover:bg-[#172c20]">Xem toàn bộ từ vựng <ArrowRight size={16} /></button></div></section>
    {recent.length > 0 && <section className="mt-8 rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Tiếp tục học</h2><button onClick={onLibrary} className="text-sm font-bold text-[#779229]">Mở thư viện</button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{recent.map((word) => <button key={word.id} onClick={() => onLibrary()} className="rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5"><div className="flex items-center justify-between"><span className="font-display font-bold">{word.word}</span><span className="text-[10px] font-semibold text-[#8a988e]">{word.part_of_speech}</span></div><p className="mt-1 text-xs text-[#86928a] line-clamp-1">{word.meaning_vi}</p></button>)}</div></section>}
  </div>;
}

function Stat({ icon, label, value, suffix, tint }: { icon: React.ReactNode; label: string; value: number; suffix: string; tint: string }) { const colors: Record<string, string> = { lime: 'bg-[#e8f3c9] text-[#719126]', yellow: 'bg-[#fff0c9] text-[#b1842f]', blue: 'bg-[#dcecef] text-[#4d8081]', peach: 'bg-[#f9e1d9] text-[#ad644d]' }; return <div className="card-shadow rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-5"><div className={`mb-4 grid h-9 w-9 place-items-center rounded-lg ${colors[tint]}`}>{icon}</div><p className="text-sm font-medium text-[#829087]">{label}</p><p className="mt-1 font-display text-3xl font-bold tracking-tight">{value}<span className="ml-1 text-sm font-semibold text-[#a3aea6]">{suffix}</span></p></div>; }

function LibraryPage({ words, search, setSearch, onSelect, progressMap }: { words: Word[]; search: string; setSearch: (value: string) => void; onSelect: (word: Word) => void; progressMap: Map<string, Progress> }) {
  const filtered = words.filter((word) => `${word.word} ${word.meaning_vi}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="animate-[fadeIn_.4s_ease-out]"><div className="mb-8"><p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Your collection</p><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-display text-4xl font-bold tracking-tight">Thư viện từ</h1><p className="mt-2 text-[#78867d]">Khám phá {words.length} từ vựng trong kho của bạn.</p></div><div className="rounded-xl bg-[#e8f2cf] px-4 py-3 text-sm font-bold text-[#57711f]"><BookOpen className="mr-2 inline" size={16} /> {filtered.length} kết quả</div></div></div><div className="mb-6 flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa69e]" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm từ hoặc nghĩa tiếng Việt..." className="w-full rounded-xl border border-[#dfe6dc] bg-[#fbfcf9] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#a8bd66] focus:ring-2 focus:ring-[#dce9bb]" /></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((word) => <WordCard key={word.id} word={word} progress={progressMap.get(word.id)} onClick={() => onSelect(word)} />)}</div>{filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[#ccd7c9] py-20 text-center"><ListFilter className="mx-auto mb-3 text-[#a9b6a9]" /><p className="font-semibold text-[#718078]">Không tìm thấy từ phù hợp</p><p className="mt-1 text-sm text-[#9aa69e]">Thử thay đổi từ khóa tìm kiếm.</p></div>}</div>;
}

function WordCard({ word, progress, onClick }: { word: Word; progress?: Progress; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-5 text-left transition hover:-translate-y-1 hover:border-[#bdcf83] hover:shadow-lg hover:shadow-[#b6c98e]/10">
      <div className="mb-5 flex items-start justify-between">
        <span className="rounded-md bg-[#f1f3ed] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#779229]">{word.part_of_speech || 'word'}</span>
        <span className={`h-2 w-2 rounded-full ${progress?.status === 'mastered' ? 'bg-[#8fb44a]' : progress?.status === 'learning' ? 'bg-[#eab95e]' : 'bg-[#cbd4cc]'}`} />
      </div>
      <h3 className="font-display text-2xl font-bold tracking-tight group-hover:text-[#789329]">{word.word}</h3>
      <div className="mt-1 flex items-center gap-2 text-sm text-[#87938b]">
        <span>{word.pronunciation}</span>
        <button onClick={(event) => { event.stopPropagation(); speak(word.word); }} className="rounded-full p-1.5 hover:bg-[#eaf1de] hover:text-[#789329]">
          <Headphones size={14} />
        </button>
      </div>
      <p className="mt-5 text-sm font-semibold text-[#4f5f56]">{word.meaning_vi}</p>
      {word.example_en && <p className="mt-3 line-clamp-1 text-xs italic text-[#91a099]">“{word.example_en}”</p>}
    </button>
  );
}

function Flashcards({ words, progressMap, onProgress }: { words: Word[]; progressMap: Map<string, Progress>; onProgress: (word: Word, correct: boolean) => Promise<void> }) {
  const studyWords = words.filter((word) => progressMap.get(word.id)?.status !== 'mastered');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = studyWords[index % Math.max(studyWords.length, 1)];

  if (!word) return <EmptyState title="Bạn đã thuộc hết rồi!" text="Tuyệt vời. Hãy quay lại thư viện để xem lại hoặc thêm từ mới." />;

  const next = async (correct: boolean) => {
    await onProgress(word, correct);
    setFlipped(false);
    setIndex((current) => (current + 1) % studyWords.length);
  };

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_.4s_ease-out]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Study mode</p>
          <h1 className="font-display text-4xl font-bold tracking-tight">Flashcard</h1>
          <p className="mt-2 text-[#78867d]">Lật thẻ, ghi nhớ và xây dựng phản xạ.</p>
        </div>
        <span className="text-sm font-bold text-[#89958b]">{index + 1} / {studyWords.length}</span>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#e4eae0]">
        <div className="h-full rounded-full bg-[#9ebc4a] transition-all" style={{ width: `${((index + 1) / studyWords.length) * 100}%` }} />
      </div>
      <button onClick={() => setFlipped((current) => !current)} className="group relative mb-6 flex min-h-[390px] w-full items-center justify-center overflow-hidden rounded-3xl bg-[#263f31] p-10 text-center text-white shadow-2xl shadow-[#263f31]/20 transition hover:-translate-y-1">
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/10" />
        <div className="absolute bottom-[-40px] left-[-30px] h-40 w-40 rounded-full border border-[#d9f36b]/15" />
        {!flipped ? (
          <div>
            <span className="mb-6 inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#d9f36b]">{word.part_of_speech || 'Vocabulary'}</span>
            <h2 className="font-display text-6xl font-bold tracking-tight sm:text-7xl">{word.word}</h2>
            <div className="mt-5 flex items-center justify-center gap-2 text-[#b5c6b7]">
              <span>{word.pronunciation}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10"><Headphones size={15} /></span>
            </div>
            <p className="mt-10 text-sm text-[#afc1b2]">Nhấn để lật thẻ</p>
          </div>
        ) : (
          <div>
            <span className="mb-5 block text-sm font-semibold uppercase tracking-wider text-[#b6c873]">Nghĩa tiếng Việt</span>
            <h2 className="font-display text-4xl font-bold text-[#f1f8d9]">{word.meaning_vi}</h2>
            {word.example_en && <p className="mx-auto mt-8 max-w-md text-base leading-7 text-[#b9c9bb]">{word.example_en}</p>}
            {word.example_vi && <p className="mt-2 text-sm italic text-[#819987]">{word.example_vi}</p>}
          </div>
        )}
      </button>
      <div className="flex flex-col gap-3 sm:flex-row">
        {flipped && (
          <>
            <button onClick={() => void next(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#edc5bb] bg-[#fff4f0] py-3.5 text-sm font-bold text-[#a85a46] transition hover:bg-[#fce6df]"><X size={17} /> Chưa nhớ</button>
            <button onClick={() => void next(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d9f36b] py-3.5 text-sm font-bold text-[#334b1c] transition hover:bg-[#cdea58]"><Check size={17} /> Đã nhớ</button>
          </>
        )}
      </div>
      {!flipped && (
        <button onClick={() => speak(word.word)} className="mx-auto mt-5 flex items-center gap-2 text-sm font-bold text-[#789329] hover:text-[#506c16]">
          <Mic2 size={16} /> Nghe phát âm
        </button>
      )}
    </div>
  );
}

function Quiz({ words, onProgress }: { words: Word[]; onProgress: (word: Word, correct: boolean) => Promise<void> }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const quizWords = words.slice(0, 10);
  const question = quizWords[index];
  const options = useMemo(() => {
    if (!question) return [];
    const others = words.filter((word) => word.id !== question.id).sort(() => Math.random() - .5).slice(0, 3);
    return [question, ...others].sort(() => Math.random() - .5);
  }, [question, words]);

  if (done || !question) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#d9f36b] text-[#456218]"><Trophy size={30} /></div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Hoàn thành!</p>
        <h1 className="font-display text-4xl font-bold">Kết quả của bạn</h1>
        <p className="mt-3 text-[#78867d]">Bạn trả lời đúng <strong className="text-[#4d6d1f]">{score}/{quizWords.length}</strong> câu hỏi.</p>
        <button onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false); }} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-bold text-white"><RotateCcw size={16} /> Làm lại</button>
      </div>
    );
  }

  const choose = async (option: Word) => {
    if (selected) return;
    const correct = option.id === question.id;
    setSelected(option.id);
    if (correct) setScore((current) => current + 1);
    await onProgress(question, correct);
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
        <span className="font-display text-lg font-bold text-[#829087]">{index + 1}<span className="text-sm"> / {quizWords.length}</span></span>
      </div>
      <div className="mb-10 h-2 overflow-hidden rounded-full bg-[#e4eae0]">
        <div className="h-full rounded-full bg-[#9ebc4a] transition-all" style={{ width: `${(index / quizWords.length) * 100}%` }} />
      </div>
      <div className="rounded-3xl border border-[#e3e8df] bg-[#fbfcf9] p-7 text-center shadow-sm sm:p-12">
        <span className="rounded-full bg-[#edf3e6] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#789329]">{question.part_of_speech || 'Vocabulary'}</span>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-[#9aa59d]">Từ nào có nghĩa là</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#294432]">{question.meaning_vi}</h2>
        <div className="mt-10 grid gap-3 text-left">
          {options.map((option, optionIndex) => {
            const isSelected = selected === option.id;
            const isCorrect = option.id === question.id;
            return (
              <button key={option.id} onClick={() => void choose(option)} className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition ${selected && isCorrect ? 'border-[#a8c65d] bg-[#edf6d8] text-[#4b681c]' : selected && isSelected ? 'border-[#e7b6aa] bg-[#fff0ec] text-[#a95542]' : 'border-[#e2e8df] bg-white hover:border-[#b7ca78] hover:bg-[#f9fced]'}`}>
                <span>
                  <span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg bg-[#f0f3ed] text-xs font-bold text-[#89958b]">{String.fromCharCode(65 + optionIndex)}</span>
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

function WordModal({ word, progress, onClose }: { word: Word; progress?: Progress; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#17231f]/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-[#fbfcf9] p-7 shadow-2xl sm:p-9" onClick={(event) => event.stopPropagation()}>
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="mb-3 flex gap-2">
              <span className="rounded-md bg-[#eef3e8] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#779229]">{word.part_of_speech || 'Từ vựng'}</span>
            </div>
            <h2 className="font-display text-4xl font-bold">{word.word}</h2>
            <p className="mt-2 text-sm text-[#8a978e]">{word.pronunciation}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-[#eef2eb] p-2 text-[#78867d] hover:bg-[#e4eadf]"><X size={18} /></button>
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
        <div className="mt-7 flex items-center justify-between">
          <span className="text-sm text-[#87938b]">{progress?.status === 'mastered' ? 'Đã thuộc' : progress?.status === 'learning' ? 'Đang học' : 'Chưa học'}</span>
          <button onClick={() => speak(word.word)} className="flex items-center gap-2 rounded-xl bg-[#263f31] px-4 py-3 text-sm font-bold text-white"><Headphones size={16} /> Nghe phát âm</button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#d9f36b] text-[#456218]"><Trophy size={26} /></div>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-[#78867d]">{text}</p>
    </div>
  );
}

const commonPartsOfSpeech = [
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

function AddWordPage({ onAdd, onDone, onError }: { onAdd: (word: NewWord) => Promise<Word>; onDone: () => void; onError: () => void }) {
  const [form, setForm] = useState<NewWord>({ word: '', pronunciation: '', part_of_speech: 'noun', meaning_vi: '', example_en: '', example_vi: '' });
  const [isCustomPartOfSpeech, setIsCustomPartOfSpeech] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [validation, setValidation] = useState('');
  const debounceTimer = useRef<number | null>(null);

  function update<K extends keyof NewWord>(key: K, value: NewWord[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setValidation('');
  }

  // Tự động tra cứu Dictionary API khi người dùng dừng gõ hoặc nhấn nút
  async function fetchDictionaryData(wordToSearch: string, isManual = false) {
    const trimmed = wordToSearch.trim();
    if (!trimmed || trimmed.includes(' ')) {
      if (isManual) setLookupMessage('Vui lòng nhập từ đơn để tự động tra cứu từ điển.');
      return;
    }

    setLookingUp(true);
    setLookupMessage('');
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed.toLowerCase())}`);
      if (!response.ok) {
        if (isManual) setLookupMessage('Không tìm thấy từ điển cho từ này. Bạn có thể tự nhập phiên âm bên dưới.');
        return;
      }
      interface DictPhonetic { text?: string; audio?: string }
      interface DictDefinition { definition?: string; example?: string }
      interface DictMeaning { partOfSpeech?: string; definitions?: DictDefinition[] }
      interface DictEntry { phonetic?: string; phonetics?: DictPhonetic[]; meanings?: DictMeaning[] }

      const data = (await response.json()) as DictEntry[];
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        // Tìm IPA
        let ipa = item.phonetic || '';
        if (!ipa && Array.isArray(item.phonetics)) {
          const found = item.phonetics.find((p) => p.text);
          if (found?.text) ipa = found.text;
        }

        // Tìm loại từ
        const pos = item.meanings?.[0]?.partOfSpeech || '';

        // Tìm câu ví dụ
        let example = '';
        if (Array.isArray(item.meanings)) {
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
      }
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
      await onAdd(form);
      onDone();
    } catch {
      onError();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_.4s_ease-out]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Create your own</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">Thêm từ vựng mới</h1>
        <p className="mt-2 text-[#78867d]">Tự tạo danh sách từ vựng phù hợp với mục tiêu học tập của bạn.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e3e8df] bg-[#fbfcf9] p-6 shadow-sm sm:p-8">
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
              <p className={`mt-1.5 text-xs font-semibold ${lookupMessage.includes('✨') ? 'text-[#5f7e27]' : 'text-[#a34e39]'}`}>
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

          {/* Loại từ (Cho phép chọn hoặc tự gõ) */}
          <Field label="Từ loại">
            <div className="flex gap-2">
              {isCustomPartOfSpeech ? (
                <input
                  value={form.part_of_speech}
                  onChange={(event) => update('part_of_speech', event.target.value)}
                  placeholder="ví dụ: phrasal verb, phrase, idiom..."
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
                    <option key={item} value={item}>{item}</option>
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

        {validation && <div className="mt-5 rounded-xl border border-[#f1d3cb] bg-[#fff2ed] px-4 py-3 text-sm text-[#a34e39]">{validation}</div>}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setForm({ word: '', pronunciation: '', part_of_speech: 'noun', meaning_vi: '', example_en: '', example_vi: '' });
              setIsCustomPartOfSpeech(false);
              setLookupMessage('');
            }}
            className="rounded-xl border border-[#dfe6dc] px-5 py-3 text-sm font-bold text-[#78867d] transition hover:bg-[#eef2eb]"
          >
            Xóa form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#172c20] disabled:opacity-60"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><Plus size={16} /> Thêm vào thư viện</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a8bd66] focus:ring-2 focus:ring-[#dce9bb]';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#78867d]">{label}{required && <span className="ml-1 text-[#c2563f]">*</span>}</span>
      {children}
    </label>
  );
}

export default App;
