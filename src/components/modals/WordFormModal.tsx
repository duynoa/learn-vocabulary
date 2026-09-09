import { X } from 'lucide-react';
import type { NewWord, Word } from '@/types';
import { WordForm } from '../word/WordForm';

export function WordFormModal({
  isOpen,
  title,
  initialWord,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  title: string;
  initialWord?: Word | null;
  onClose: () => void;
  onSave: (data: NewWord) => Promise<void>;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/40 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl my-6 max-h-[92vh] overflow-y-auto rounded-3xl border border-[#e3e8df] bg-[#fbfcf9] p-6 shadow-2xl sm:p-8 animate-[fadeIn_.2s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#e3e8df] pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#17231f]">{title}</h2>
            <p className="mt-1 text-xs text-[#78867d]">
              {initialWord ? `Cập nhật thông tin cho từ "${initialWord.word}"` : 'Tạo từ vựng mới để mở rộng vốn từ của bạn.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#eef2eb] p-2 text-[#78867d] hover:bg-[#e4eadf] transition"
          >
            <X size={18} />
          </button>
        </div>

        <WordForm
          initialWord={initialWord}
          isModal={true}
          onSave={onSave}
          onCancel={onClose}
          submitLabel={initialWord ? 'Lưu thay đổi' : 'Thêm vào thư viện'}
        />
      </div>
    </div>
  );
}
