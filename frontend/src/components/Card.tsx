import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  gradientBorder?: boolean;
};

export function Card({ children, className = "", gradientBorder = false }: CardProps) {
  if (gradientBorder) {
    return (
      <div
        className={`rounded-2xl bg-gradient-to-br from-emerald-400/60 via-teal-300/50 to-cyan-400/60 p-[1.5px] shadow-md transition-all duration-300 hover:shadow-xl dark:from-emerald-500/40 dark:via-teal-400/30 dark:to-cyan-500/40 ${className}`.trim()}
      >
        <div className="h-full rounded-2xl bg-surface p-6">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${className}`.trim()}
    >
      {children}
    </div>
  );
}
