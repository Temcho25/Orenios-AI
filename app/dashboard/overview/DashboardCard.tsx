"use client";

type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
  accent: string;
};

export default function DashboardCard({
  title,
  value,
  description,
  accent,
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/25 hover:shadow-[0_20px_45px_-15px_rgba(124,111,240,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground/90">
            {title}
          </p>

          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground">
            {value}
          </p>

          <p className="mt-2 text-sm text-foreground/40">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-surface-strong px-3 py-1.5 text-xs font-semibold text-foreground/60">
          {accent}
        </span>
      </div>
    </div>
  );
}
