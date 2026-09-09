import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  CircleHelp,
  Flame,
  Home,
  Library,
  Menu,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { WordModal } from '../modals/WordModal';
import { WordFormModal } from '../modals/WordFormModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

export function AppLayout() {
  const {
    loading,
    error,
    setError,
    studiedToday,
    toast,
    showToast,
    progressMap,
    selectedWord,
    setSelectedWord,
    editingWord,
    setEditingWord,
    deletingWord,
    setDeletingWord,
    isAddModalOpen,
    setIsAddModalOpen,
    addWord,
    updateWord,
    deleteWord,
  } = useVocabulary();

  const [mobileNav, setMobileNav] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6f7f2]">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#d9f36b] text-[#17231f]">
            <Sparkles size={24} />
          </div>
          <p className="font-display text-lg font-semibold">Đang chuẩn bị bài học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#17231f]">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-[#e3e8df] bg-[#f9faf6] p-6 transition-transform lg:translate-x-0 ${
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9f36b] text-[#203325]">
            <Sparkles size={19} strokeWidth={2.5} />
          </div>
          <span className="font-display text-[22px] font-bold tracking-tight">
            wordly<span className="text-[#8aa52f]">.</span>
          </span>
        </div>

        <nav className="space-y-2">
          <NavItem to="/dashboard" icon={<Home size={18} />} label="Tổng quan" onClick={() => setMobileNav(false)} />
          <NavItem to="/library" icon={<Library size={18} />} label="Thư viện từ" onClick={() => setMobileNav(false)} />
          <NavItem to="/flashcards" icon={<RotateCcw size={18} />} label="Flashcard" onClick={() => setMobileNav(false)} />
          <NavItem to="/quiz" icon={<CircleHelp size={18} />} label="Luyện tập" onClick={() => setMobileNav(false)} />
          <NavItem to="/add" icon={<Plus size={18} />} label="Thêm từ" onClick={() => setMobileNav(false)} />
        </nav>

        <div className="mt-auto rounded-2xl bg-[#edf3e6] p-4">
          <div className="mb-3 flex items-center gap-2 text-[#5d7730]">
            <Target size={17} />
            <span className="text-xs font-bold uppercase tracking-wider">Mục tiêu hôm nay</span>
          </div>
          <div className="mb-2 flex items-end justify-between">
            <span className="font-display text-2xl font-bold">
              {studiedToday}
              <span className="text-sm font-medium text-[#78905b]"> / 10 từ</span>
            </span>
            <span className="text-sm font-semibold text-[#6c8641]">{Math.min(studiedToday * 10, 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#d8e4cc]">
            <div
              className="h-full rounded-full bg-[#91ad3a] transition-all"
              style={{ width: `${Math.min(studiedToday * 10, 100)}%` }}
            />
          </div>
        </div>

        <button className="mt-5 flex items-center gap-3 px-2 py-2 text-sm font-semibold text-[#708078] transition hover:text-[#203325]">
          <Settings2 size={18} /> Cài đặt
        </button>
      </aside>

      {/* Backdrop for mobile navigation */}
      {mobileNav && (
        <button
          aria-label="Đóng menu"
          className="fixed inset-0 z-20 bg-[#17231f]/20 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="lg:ml-[252px]">
        <header className="flex h-fit items-center justify-between border-b border-[#e3e8df] bg-[#f9faf6]/80 px-5 py-2 backdrop-blur lg:px-10">
          <button className="rounded-lg p-2 hover:bg-[#edf2e9] lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu size={21} />
          </button>
          <div className="hidden text-sm font-medium text-[#7b8880] lg:block">Chào mừng bạn quay trở lại!</div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-[#fff3d6] px-3 py-2 text-sm font-bold text-[#b47e23] sm:flex">
              <Flame size={16} fill="currentColor" /> 5 ngày
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1420px] px-5 py-5 lg:px-10 lg:py-10">
          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#f1d3cb] bg-[#fff2ed] px-4 py-3 text-sm text-[#a34e39]">
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Render Route Page */}
          <Outlet />
        </div>
      </main>

      {/* Modal Xem chi tiết từ */}
      {selectedWord && (
        <WordModal
          word={selectedWord}
          progress={progressMap.get(selectedWord.id)}
          onClose={() => setSelectedWord(null)}
          onEdit={(word) => {
            setSelectedWord(null);
            setEditingWord(word);
          }}
          onDelete={(word) => {
            setSelectedWord(null);
            setDeletingWord(word);
          }}
        />
      )}

      {/* Modal Thêm từ mới (popup) */}
      <WordFormModal
        isOpen={isAddModalOpen}
        title="Thêm từ vựng mới"
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (input) => {
          await addWord(input);
          showToast(`Đã thêm "${input.word}" vào thư viện!`);
          setIsAddModalOpen(false);
        }}
      />

      {/* Modal Chỉnh sửa từ vựng */}
      <WordFormModal
        isOpen={!!editingWord}
        title="Chỉnh sửa từ vựng"
        initialWord={editingWord}
        onClose={() => setEditingWord(null)}
        onSave={async (input) => {
          if (editingWord) {
            await updateWord(editingWord.id, input);
            showToast(`Đã cập nhật từ "${input.word}"!`);
            setEditingWord(null);
          }
        }}
      />

      {/* Modal Xác nhận xóa từ vựng */}
      {deletingWord && (
        <ConfirmDeleteModal
          word={deletingWord}
          loading={deleteLoading}
          onClose={() => setDeletingWord(null)}
          onConfirm={async () => {
            setDeleteLoading(true);
            try {
              await deleteWord(deletingWord.id);
              setDeletingWord(null);
              showToast('Đã xóa từ khỏi thư viện!');
            } catch {
              showToast('Không thể xóa từ. Vui lòng thử lại.');
            } finally {
              setDeleteLoading(false);
            }
          }}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#263f31] px-5 py-3 text-sm font-semibold text-white shadow-lg animate-[fadeIn_.2s_ease-out]">
          {toast}
        </div>
      )}
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
          isActive
            ? 'bg-[#e8f2cf] text-[#39551d]'
            : 'text-[#718078] hover:bg-[#eef2eb] hover:text-[#253c2f]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {icon}
          <span>{label}</span>
          {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#89a72e]" />}
        </>
      )}
    </NavLink>
  );
}
