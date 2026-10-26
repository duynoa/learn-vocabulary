import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { WordForm } from '@/components/word/WordForm';

export function AddWordPage() {
  const navigate = useNavigate();
  const { addWord, showToast, setIsAiModalOpen } = useVocabulary();

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_.4s_ease-out]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Create your own</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">Thêm từ vựng mới</h1>
        <p className="mt-2 text-[#78867d]">Tự tạo danh sách từ vựng phù hợp với mục tiêu học tập của bạn.</p>
      </div>

      <div className="mb-6 p-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#c4dc80] bg-[#f5fad9] p-4.5 text-sm text-[#425d18]">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e4f0b8] text-[#51721e]">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-bold">Tạo nhanh từ vựng cùng chủ đề với Gemini AI</p>
            <p className="text-xs text-[#637d38]">Sinh trọn bộ từ vựng, phiên âm IPA, giải nghĩa và câu ví dụ chỉ sau vài giây.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="rounded-xl bg-[#263f31] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#263f31]/10 hover:bg-[#172c20] transition shrink-0"
        >
          Dùng AI ngay ✨
        </button>
      </div>

      <div className="rounded-3xl border border-[#e3e8df] bg-[#fbfcf9] p-6 shadow-sm sm:p-8">
        <WordForm
          onSave={async (word) => {
            try {
              await addWord(word);
              showToast(`Đã thêm "${word.word}" vào thư viện!`);
              navigate('/library');
            } catch {
              showToast('Không thêm được từ. Vui lòng thử lại.');
            }
          }}
          onCancel={() => navigate('/library')}
          submitLabel="Thêm vào thư viện"
        />
      </div>
    </div>
  );
}
