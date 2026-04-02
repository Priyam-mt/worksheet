import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: ReactNode;
  helper: string;
  tone?: 'default' | 'warning' | 'success';
}

const toneClasses: Record<NonNullable<StatsCardProps['tone']>, string> = {
  default:
    'border-white/60 bg-white/80 dark:border-white/10 dark:bg-slate-900/75',
  success:
    'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-500/20 dark:bg-emerald-950/40',
  warning:
    'border-amber-200/80 bg-amber-50/90 dark:border-amber-500/20 dark:bg-amber-950/40',
};

export function StatsCard({
  label,
  value,
  helper,
  tone = 'default',
}: StatsCardProps) {
  return (
    <article
      className={`rounded-[24px] border p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)] backdrop-blur-sm ${toneClasses[tone]}`}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-4 font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{helper}</p>
    </article>
  );
}
