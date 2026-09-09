import React from 'react';

export const inputClass =
  'w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a8bd66] focus:ring-2 focus:ring-[#dce9bb]';

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#78867d]">
        {label}
        {required && <span className="ml-1 text-[#c2563f]">*</span>}
      </span>
      {children}
    </label>
  );
}
