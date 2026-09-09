import React from 'react';

export function Stat({
  icon,
  label,
  value,
  suffix,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  tint: 'lime' | 'yellow' | 'blue' | 'peach' | string;
}) {
  const colors: Record<string, string> = {
    lime: 'bg-[#e8f3c9] text-[#719126]',
    yellow: 'bg-[#fff0c9] text-[#b1842f]',
    blue: 'bg-[#dcecef] text-[#4d8081]',
    peach: 'bg-[#f9e1d9] text-[#ad644d]',
  };

  return (
    <div className="card-shadow rounded-2xl border border-[#e3e8df] bg-[#fbfcf9] p-5">
      <div className={`mb-4 grid h-9 w-9 place-items-center rounded-lg ${colors[tint] || colors.lime}`}>{icon}</div>
      <p className="text-sm font-medium text-[#829087]">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight">
        {value}
        <span className="ml-1 text-sm font-semibold text-[#a3aea6]">{suffix}</span>
      </p>
    </div>
  );
}
