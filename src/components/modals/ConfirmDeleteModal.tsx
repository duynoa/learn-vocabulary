import { Loader2, Trash2 } from 'lucide-react';
import type { Word } from '@/types';

export function ConfirmDeleteModal({
  word,
  loading,
  onConfirm,
  onClose,
}: {
  word: Word;
  loading: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#17231f]/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-[#e3e8df] bg-[#fbfcf9] p-6 shadow-2xl sm:p-7 animate-[fadeIn_.2s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fee4e2] text-[#d92d20]">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#17231f]">Xác nhận xóa từ</h3>
            <p className="text-xs text-[#78867d]">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-[#526259]">
          Bạn có chắc chắn muốn xóa từ <strong className="font-bold text-[#17231f]">"{word.word}"</strong> ({word.meaning_vi}) khỏi thư viện? Tất cả tiến độ học liên quan đến từ này cũng sẽ bị xóa.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-[#dfe6dc] px-4 py-2.5 text-sm font-bold text-[#78867d] hover:bg-[#eef2eb] transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className="flex items-center gap-2 rounded-xl bg-[#d92d20] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#b42318] transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
}
