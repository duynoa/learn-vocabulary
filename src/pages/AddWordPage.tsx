import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '@/context/VocabularyContext';
import { WordForm } from '@/components/word/WordForm';

export function AddWordPage() {
  const navigate = useNavigate();
  const { addWord, showToast } = useVocabulary();

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_.4s_ease-out]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[#8ca245]">Create your own</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">Thêm từ vựng mới</h1>
        <p className="mt-2 text-[#78867d]">Tự tạo danh sách từ vựng phù hợp với mục tiêu học tập của bạn.</p>
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
