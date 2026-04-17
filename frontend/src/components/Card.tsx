import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  gradientBorder?: boolean;
};

export function Card({ children, className = "", gradientBorder = false }: CardProps) {
  if (gradientBorder) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-emerald-200/70 via-teal-100/60 to-cyan-200/70 p-[1px] shadow-md transition-all duration-300 hover:shadow-xl ${className}`.trim()}>
        <div className="h-full rounded-2xl bg-white p-6">{children}</div>
      </div>
    );
  }

  return <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 ${className}`.trim()}>{children}</div>;
}
