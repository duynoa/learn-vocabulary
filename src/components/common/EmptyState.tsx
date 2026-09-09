import { Trophy } from 'lucide-react';

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#d9f36b] text-[#456218]">
        <Trophy size={26} />
      </div>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-[#78867d]">{text}</p>
    </div>
  );
}
